import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

const findMock = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ find: findMock }) }))

// The real one caches; here it just runs, so a test observes the work.
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }))

const getServerSideSitemapMock = vi.fn(async (entries: unknown) => entries)
vi.mock('next-sitemap', () => ({
  getServerSideSitemap: (entries: unknown) => getServerSideSitemapMock(entries),
}))

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://www.amerikiosks.com'
  findMock.mockResolvedValue({ docs: [] })
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.clearAllMocks()
})

async function run() {
  const { GET } = await import('@/app/(frontend)/(sitemaps)/pages-sitemap.xml/route')
  await GET()
  return getServerSideSitemapMock.mock.calls[0][0] as { loc: string; lastmod: string }[]
}

describe('pages sitemap', () => {
  // Only published pages belong in a sitemap: listing a draft invites a crawler
  // to a 404, and `overrideAccess: false` is what keeps unpublished work out.
  it('asks only for published pages, with access enforced', async () => {
    await run()
    for (const [args] of findMock.mock.calls) {
      expect(args.collection).toBe('pages')
      expect(args.draft).toBe(false)
      expect(args.overrideAccess).toBe(false)
      expect(args.where._status.equals).toBe('published')
    }
  })

  it('queries once per locale', async () => {
    await run()
    expect(findMock.mock.calls.map(([a]) => a.locale)).toEqual(['en', 'es'])
  })

  // `localePrefix: 'as-needed'` — the default locale carries no prefix, and
  // getting this wrong publishes a sitemap full of URLs that redirect.
  it('prefixes only the non-default locale', async () => {
    findMock.mockResolvedValue({ docs: [{ slug: 'faq', updatedAt: '2026-07-01T00:00:00.000Z' }] })
    const entries = await run()
    const locs = entries.map((e) => e.loc)

    expect(locs).toContain('https://www.amerikiosks.com/faq')
    expect(locs).toContain('https://www.amerikiosks.com/es/faq')
  })

  // The home page is stored with slug `home`, but its URL is `/`. Emitting
  // `/home` would list a page that does not exist.
  it('maps the home slug to the site root', async () => {
    findMock.mockResolvedValue({ docs: [{ slug: 'home', updatedAt: '2026-07-01T00:00:00.000Z' }] })
    const locs = (await run()).map((e) => e.loc)

    expect(locs).toContain('https://www.amerikiosks.com/')
    expect(locs).toContain('https://www.amerikiosks.com/es')
    expect(locs.some((l) => l.endsWith('/home'))).toBe(false)
  })

  it('always includes the fixed routes for both locales', async () => {
    const locs = (await run()).map((e) => e.loc)
    for (const path of ['/search', '/insights', '/es/search', '/es/insights']) {
      expect(locs).toContain(`https://www.amerikiosks.com${path}`)
    }
  })

  // A page row with no slug would produce `${SITE_URL}/undefined`.
  it('skips documents with no slug', async () => {
    findMock.mockResolvedValue({
      docs: [{ updatedAt: '2026-07-01T00:00:00.000Z' }, { slug: 'ok' }],
    })
    const locs = (await run()).map((e) => e.loc)

    expect(locs.some((l) => l.includes('undefined'))).toBe(false)
    expect(locs).toContain('https://www.amerikiosks.com/ok')
  })

  it('falls back to now when a document has no updatedAt', async () => {
    findMock.mockResolvedValue({ docs: [{ slug: 'ok' }] })
    const entry = (await run()).find((e) => e.loc.endsWith('/ok'))
    expect(entry?.lastmod).toBeTruthy()
  })

  it('survives a collection that returns no docs array', async () => {
    findMock.mockResolvedValue({})
    await expect(run()).resolves.toBeTruthy()
  })
})

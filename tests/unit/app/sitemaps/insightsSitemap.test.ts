import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
const findMock = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ find: findMock }) }))
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
  const { GET } = await import('@/app/(frontend)/(sitemaps)/insights-sitemap.xml/route')
  await GET()
  return getServerSideSitemapMock.mock.calls[0][0] as { loc: string; lastmod: string }[]
}

describe('insights sitemap', () => {
  it('asks only for published insights, with access enforced', async () => {
    await run()
    for (const [args] of findMock.mock.calls) {
      expect(args.collection).toBe('insights')
      expect(args.draft).toBe(false)
      expect(args.overrideAccess).toBe(false)
      expect(args.where._status.equals).toBe('published')
    }
  })

  // Slugs are translated per locale, so each locale has to be queried in its
  // own — reusing one locale's slugs would publish URLs that 404 in the other.
  it('queries once per locale', async () => {
    await run()
    expect(findMock.mock.calls.map(([a]) => a.locale)).toEqual(['en', 'es'])
  })

  it('prefixes only the non-default locale', async () => {
    findMock.mockResolvedValue({
      docs: [{ slug: 'a-post', updatedAt: '2026-07-01T00:00:00.000Z' }],
    })
    const locs = (await run()).map((e) => e.loc)

    expect(locs).toContain('https://www.amerikiosks.com/insights/a-post')
    expect(locs).toContain('https://www.amerikiosks.com/es/insights/a-post')
  })

  it('skips documents with no slug', async () => {
    findMock.mockResolvedValue({
      docs: [{ updatedAt: '2026-07-01T00:00:00.000Z' }, { slug: 'ok' }],
    })
    const locs = (await run()).map((e) => e.loc)

    expect(locs.some((l) => l.includes('undefined'))).toBe(false)
    expect(locs).toContain('https://www.amerikiosks.com/insights/ok')
  })

  it('falls back to now when a document has no updatedAt', async () => {
    findMock.mockResolvedValue({ docs: [{ slug: 'ok' }] })
    expect((await run())[0]?.lastmod).toBeTruthy()
  })

  it('survives a collection that returns no docs array', async () => {
    findMock.mockResolvedValue({})
    await expect(run()).resolves.toBeTruthy()
  })
})

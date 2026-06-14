import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))
vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'https://amerikiosks.com',
}))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

async function importRobots() {
  const mod = await import('@/app/robots')
  return mod.default
}

describe('robots()', () => {
  it('blocks all when noIndex is true', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ noIndex: true, robotsRules: [] }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] })
  })

  it('allows all with sitemap when noIndex false and no rules', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ noIndex: false, robotsRules: [] }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://amerikiosks.com/sitemap.xml',
    })
  })

  it('maps robotsRules to MetadataRoute.Robots when noIndex false', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        noIndex: false,
        robotsRules: [
          { userAgent: 'Googlebot', allow: [{ path: '/' }], disallow: [] },
          { userAgent: 'GPTBot', allow: [], disallow: [{ path: '/' }] },
        ],
      }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({
      rules: [
        { userAgent: 'Googlebot', allow: ['/'], disallow: [] },
        { userAgent: 'GPTBot', allow: [], disallow: ['/'] },
      ],
      sitemap: 'https://amerikiosks.com/sitemap.xml',
    })
  })
})

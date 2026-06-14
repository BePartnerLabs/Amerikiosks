import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'https://amerikiosks.com',
}))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

async function callGET() {
  vi.resetModules()
  const mod = await import('@/app/llms.txt/route')
  return mod.GET()
}

describe('GET /llms.txt', () => {
  it('returns 404 when llmsEnabled is false', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ llmsEnabled: false }),
      find: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const res = await callGET()
    expect(res.status).toBe(404)
  })

  it('returns 200 text/plain with site description when enabled', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        llmsEnabled: true,
        llmsSiteDescription: 'Branded kiosk experiences.',
        llmsIncludePages: true,
        llmsIncludeInsights: false,
      }),
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            title: 'Home',
            slug: '',
            meta: { description: 'Home page' },
            breadcrumbs: [{ url: '/' }],
          },
        ],
      }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const res = await callGET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
    const body = await res.text()
    expect(body).toContain('# Amerikiosks')
    expect(body).toContain('Branded kiosk experiences.')
    expect(body).toContain('## Pages')
    expect(body).toContain('[Home](https://amerikiosks.com/)')
    expect(body).not.toContain('## Insights')
  })

  it('includes Insights section when llmsIncludeInsights is true', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        llmsEnabled: true,
        llmsSiteDescription: '',
        llmsIncludePages: false,
        llmsIncludeInsights: true,
      }),
      find: vi
        .fn()
        .mockResolvedValue({ docs: [{ title: 'Post One', slug: 'post-one', meta: {} }] }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    const res = await callGET()
    const body = await res.text()
    expect(body).toContain('## Insights')
    expect(body).toContain('[Post One](https://amerikiosks.com/insights/post-one)')
    expect(body).not.toContain('## Pages')
  })
})

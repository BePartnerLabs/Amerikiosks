import { beforeEach, describe, expect, it, vi } from 'vitest'

const enable = vi.fn()
const disable = vi.fn()

vi.mock('next/headers', () => ({
  draftMode: vi.fn(async () => ({ enable, disable })),
}))

const redirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}))

vi.mock('@payload-config', () => ({ default: {} }))

const auth = vi.fn()
const logger = { error: vi.fn() }
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ auth, logger })),
}))

function fakeRequest(params: Record<string, string>) {
  const search = new URLSearchParams(params).toString()
  return {
    url: `https://example.com/next/preview${search ? `?${search}` : ''}`,
    headers: new Headers(),
  } as unknown as Request
}

describe('GET /next/preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when search params are missing', async () => {
    const { GET } = await import('@/app/(frontend)/next/preview/route')

    const res = await GET(fakeRequest({}) as never)

    expect(res.status).toBe(404)
  })

  it('returns 500 for a non-relative path (open-redirect guard)', async () => {
    const { GET } = await import('@/app/(frontend)/next/preview/route')

    const res = await GET(
      fakeRequest({ path: 'https://evil.com', collection: 'pages', slug: 'home' }) as never,
    )

    expect(res.status).toBe(500)
  })

  it('denies preview for an anonymous visitor: payload.auth() resolves { user: null, permissions } which is always truthy, so the fix must destructure user and check it, not the whole result', async () => {
    auth.mockResolvedValue({ user: null, permissions: {} })
    const { GET } = await import('@/app/(frontend)/next/preview/route')

    const res = await GET(
      fakeRequest({ path: '/some-page', collection: 'pages', slug: 'some-page' }) as never,
    )

    expect(res.status).toBe(403)
    expect(disable).toHaveBeenCalled()
    expect(enable).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('enables draft mode for an authenticated user', async () => {
    auth.mockResolvedValue({ user: { id: 1 }, permissions: {} })
    const { GET } = await import('@/app/(frontend)/next/preview/route')

    await GET(fakeRequest({ path: '/some-page', collection: 'pages', slug: 'some-page' }) as never)

    expect(enable).toHaveBeenCalled()
    expect(disable).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/some-page')
  })
})

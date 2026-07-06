import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

describe('revalidateRedirects', () => {
  it('logs and revalidates the "redirects" tag, returning the doc unchanged', async () => {
    const { revalidateRedirects } = await import('@/hooks/revalidateRedirects')
    const { revalidateTag } = await import('next/cache')

    const info = vi.fn()
    const doc = { id: 1, from: '/old', to: '/new' }

    const result = revalidateRedirects({
      doc,
      req: { payload: { logger: { info } } },
    } as never)

    expect(result).toBe(doc)
    expect(info).toHaveBeenCalledWith('Revalidating redirects')
    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
  })
})

import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

const { find } = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
}))

import { getCachedRedirects, getRedirects } from '@/utilities/getRedirects'

describe('getRedirects', () => {
  it('fetches all redirects from the redirects collection', async () => {
    find.mockResolvedValue({ docs: [{ from: '/old', to: { url: '/new' } }] })

    const result = await getRedirects()

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'redirects', depth: 1, limit: 0, pagination: false }),
    )
    expect(result).toEqual([{ from: '/old', to: { url: '/new' } }])
  })

  it('passes a custom depth through to payload.find', async () => {
    find.mockResolvedValue({ docs: [] })

    await getRedirects(2)

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ depth: 2 }))
  })
})

describe('getCachedRedirects', () => {
  it('returns a function that resolves the redirects list', async () => {
    find.mockResolvedValue({ docs: [] })

    const cached = getCachedRedirects()
    const result = await cached()

    expect(result).toEqual([])
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetRedirectCache, findRedirect } from '@/plugins/redirects/lookup'
import type { RedirectEntry } from '@/plugins/redirects/types'

const ORIGIN = 'https://amerikiosks.com'

const entries: RedirectEntry[] = [
  { from: '/our-history', to: '/our-story', status: 301 },
  { from: '/contact-old/london-office', to: '/contact', status: 301 },
  { from: '/temporary', to: '/somewhere', status: 302 },
]

const mockFetch = (payload: RedirectEntry[] = entries, ok = true) =>
  vi.fn(async () => ({ ok, json: async () => payload }) as unknown as Response)

beforeEach(() => {
  __resetRedirectCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('findRedirect', () => {
  it('resolves a redirect regardless of trailing slash or casing', async () => {
    vi.stubGlobal('fetch', mockFetch())

    expect(await findRedirect('/our-history', ORIGIN)).toEqual({ to: '/our-story', status: 301 })
    expect(await findRedirect('/Our-History/', ORIGIN)).toEqual({ to: '/our-story', status: 301 })
  })

  it('resolves multi-segment paths, which the old component-based approach could not reach', async () => {
    vi.stubGlobal('fetch', mockFetch())

    expect(await findRedirect('/contact-old/london-office/', ORIGIN)).toEqual({
      to: '/contact',
      status: 301,
    })
  })

  it('carries the visitor locale over to the destination', async () => {
    vi.stubGlobal('fetch', mockFetch())

    expect(await findRedirect('/es/our-history', ORIGIN)).toEqual({
      to: '/es/our-story',
      status: 301,
    })
  })

  it('preserves a 302 when the editor asked for a temporary redirect', async () => {
    vi.stubGlobal('fetch', mockFetch())

    expect(await findRedirect('/temporary', ORIGIN)).toEqual({ to: '/somewhere', status: 302 })
  })

  it('returns null when nothing matches', async () => {
    vi.stubGlobal('fetch', mockFetch())

    expect(await findRedirect('/still-a-real-page', ORIGIN)).toBeNull()
  })

  it('fetches once and serves the rest from memory', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)

    await findRedirect('/a', ORIGIN)
    await findRedirect('/b', ORIGIN)
    await findRedirect('/our-history', ORIGIN)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('refetches once the TTL has passed', async () => {
    vi.useFakeTimers()
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)

    await findRedirect('/our-history', ORIGIN)
    vi.advanceTimersByTime(61_000)
    await findRedirect('/our-history', ORIGIN)

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('keeps serving the last known table when the endpoint fails', async () => {
    vi.useFakeTimers()
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => entries })
      .mockRejectedValueOnce(new Error('boom'))
    vi.stubGlobal('fetch', fetchSpy)

    await findRedirect('/our-history', ORIGIN)
    vi.advanceTimersByTime(61_000)

    expect(await findRedirect('/our-history', ORIGIN)).toEqual({ to: '/our-story', status: 301 })
  })

  it('matches nothing rather than throwing when the first load fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('boom')
      }),
    )

    expect(await findRedirect('/our-history', ORIGIN)).toBeNull()
  })
})

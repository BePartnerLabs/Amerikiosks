import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/repositories/clients/ApiClient'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// The HTTP layer, and only that: it builds the request, throws on a non-OK
// response, and hands the body back. Every repository depends on it behaving
// predictably, and a swallowed error here surfaces as a form that says it
// submitted when it did not.
describe('apiClient', () => {
  it('posts JSON and returns the parsed body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 7 }) })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiClient.post('/next/x', { a: 1 })).resolves.toEqual({ id: 7 })

    const [url, init] = fetchMock.mock.calls[0]
    // Resolved against the server URL: the same repository runs in a server
    // component, where a relative path has no origin to resolve against.
    expect(String(url)).toMatch(/\/next\/x$/)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual({ a: 1 })
  })

  it('throws on a non-OK response rather than returning it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'bad' }) }),
    )

    await expect(apiClient.post('/next/x', {})).rejects.toThrow()
  })

  it('gets and parses a response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: 1 }) }))
    await expect(apiClient.get('/next/y')).resolves.toEqual({ ok: 1 })
  })

  it('throws on a failed get', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )
    await expect(apiClient.get('/next/y')).rejects.toThrow()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { ServerHttpClient } from '@/repositories/clients/ServerHttpClient'

describe('ServerHttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET resolves with the parsed JSON body on success, using the exact absolute URL given', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new ServerHttpClient()
    const result = await client.get<{ hello: string }>('https://api.example.com/some/path')

    expect(result).toEqual({ hello: 'world' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/some/path',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('GET throws a descriptive error when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) }),
    )

    const client = new ServerHttpClient()
    await expect(client.get('https://api.example.com/missing')).rejects.toThrow(
      'GET https://api.example.com/missing failed with 404',
    )
  })

  it('POST sends a JSON body to the absolute URL and resolves with the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ created: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new ServerHttpClient()
    const result = await client.post('https://api.example.com/create', { name: 'test' })

    expect(result).toEqual({ created: true })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/create')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ name: 'test' }))
  })

  it('POST throws a descriptive error when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )

    const client = new ServerHttpClient()
    await expect(client.post('https://api.example.com/create', {})).rejects.toThrow(
      'POST https://api.example.com/create failed with 500',
    )
  })

  it('does not reference window (safe to run in a server/Node context)', () => {
    expect(() => new ServerHttpClient()).not.toThrow()
  })
})

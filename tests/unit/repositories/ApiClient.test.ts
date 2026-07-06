import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '@/repositories/clients/ApiClient'

describe('ApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET resolves with the parsed JSON body on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient()
    const result = await client.get<{ hello: string }>('/some/path')

    expect(result).toEqual({ hello: 'world' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/some/path'))
  })

  it('GET appends query params to the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient()
    await client.get('/some/path', { foo: 'bar' })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('foo=bar'))
  })

  it('GET throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) }),
    )

    const client = new ApiClient()
    await expect(client.get('/missing')).rejects.toThrow('GET /missing failed with 404')
  })

  it('POST sends a JSON body and resolves with the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ created: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient()
    const result = await client.post('/create', { name: 'test' })

    expect(result).toEqual({ created: true })
    const [, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ name: 'test' }))
  })

  it('POST throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )

    const client = new ApiClient()
    await expect(client.post('/create', {})).rejects.toThrow('POST /create failed with 500')
  })
})

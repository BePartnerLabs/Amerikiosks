import { afterEach, describe, expect, it, vi } from 'vitest'
import { UsersRepository } from '@/repositories/UsersRepository'

describe('UsersRepository.getMe', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the parsed user payload on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'abc', user: { id: 1 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await UsersRepository.getMe('abc')

    expect(result).toEqual({ token: 'abc', user: { id: 1 } })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/users/me')
    expect(options.headers.Authorization).toBe('JWT abc')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(UsersRepository.getMe('bad-token')).rejects.toThrow(
      'UsersRepository: getMe failed with 401',
    )
  })
})

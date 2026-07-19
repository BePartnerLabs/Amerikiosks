import { afterEach, describe, expect, it, vi } from 'vitest'

class RedirectError extends Error {
  digest: string
  constructor(url: string) {
    super(`NEXT_REDIRECT`)
    this.digest = `NEXT_REDIRECT;replace;${url};307;`
  }
}

const redirect = vi.fn((url: string) => {
  throw new RedirectError(url)
})
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
}))

const cookieGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => cookieGet(name) }),
}))

const getMe = vi.fn()
vi.mock('@/repositories', () => ({
  UsersRepository: { getMe: (token: string) => getMe(token) },
}))

import { getMeUser } from '@/utilities/getMeUser'

describe('getMeUser', () => {
  afterEach(() => {
    redirect.mockClear()
    cookieGet.mockReset()
    getMe.mockReset()
  })

  it('returns the token and user when a token cookie is present and the user resolves', async () => {
    cookieGet.mockReturnValue({ value: 'abc123' })
    getMe.mockResolvedValue({ user: { id: 1, email: 'a@b.com' } })

    const result = await getMeUser()

    expect(result).toEqual({ token: 'abc123', user: { id: 1, email: 'a@b.com' } })
    expect(getMe).toHaveBeenCalledWith('abc123')
  })

  it('throws when there is no token cookie and no nullUserRedirect is given', async () => {
    cookieGet.mockReturnValue(undefined)
    getMe.mockResolvedValue({ user: null })

    await expect(getMeUser()).rejects.toThrow('Missing auth token')
  })

  it('redirects to nullUserRedirect when there is no user', async () => {
    cookieGet.mockReturnValue({ value: 'abc123' })
    getMe.mockResolvedValue({ user: null })

    await expect(getMeUser({ nullUserRedirect: '/login' })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to validUserRedirect when a user is present', async () => {
    cookieGet.mockReturnValue({ value: 'abc123' })
    getMe.mockResolvedValue({ user: { id: 1 } })

    await expect(getMeUser({ validUserRedirect: '/dashboard' })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to nullUserRedirect when getMe throws and nullUserRedirect is set', async () => {
    cookieGet.mockReturnValue({ value: 'abc123' })
    getMe.mockRejectedValue(new Error('network error'))

    await expect(getMeUser({ nullUserRedirect: '/login' })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('rethrows the original error when getMe throws and no nullUserRedirect is set', async () => {
    cookieGet.mockReturnValue({ value: 'abc123' })
    getMe.mockRejectedValue(new Error('network error'))

    await expect(getMeUser()).rejects.toThrow('network error')
    expect(redirect).not.toHaveBeenCalled()
  })
})

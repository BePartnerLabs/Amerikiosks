import { afterEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()

vi.mock('@/repositories/clients/ApiClient', () => ({
  apiClient: { get },
}))

describe('PagesRepository.translateSlug', () => {
  afterEach(() => {
    get.mockReset()
  })

  it('returns the translated slug on success', async () => {
    get.mockResolvedValue({ slug: 'para-marcas' })
    const { PagesRepository } = await import('@/repositories/PagesRepository')

    const result = await PagesRepository.translateSlug('for-brands', 'en', 'es')

    expect(result).toBe('para-marcas')
    expect(get).toHaveBeenCalledWith('/next/translate-slug', {
      slug: 'for-brands',
      from: 'en',
      to: 'es',
    })
  })

  it('falls back to the original slug when the API returns no slug', async () => {
    get.mockResolvedValue({})
    const { PagesRepository } = await import('@/repositories/PagesRepository')

    const result = await PagesRepository.translateSlug('for-brands', 'en', 'es')

    expect(result).toBe('for-brands')
  })

  it('falls back to the original slug when the request fails', async () => {
    get.mockRejectedValue(new Error('network error'))
    const { PagesRepository } = await import('@/repositories/PagesRepository')

    const result = await PagesRepository.translateSlug('for-brands', 'en', 'es')

    expect(result).toBe('for-brands')
  })
})

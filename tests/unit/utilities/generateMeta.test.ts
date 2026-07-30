import { describe, expect, it } from 'vitest'
import { generateMeta } from '@/utilities/generateMeta'

describe('generateMeta', () => {
  it('falls back to the site default title when doc is null', async () => {
    const result = await generateMeta({ doc: null })
    expect(result.title).toBe('Amerikiosks')
    expect(result.description).toBeUndefined()
  })

  it('falls back to the site default title when meta.title is missing', async () => {
    const result = await generateMeta({ doc: { slug: 'no-meta' } })
    expect(result.title).toBe('Amerikiosks')
  })

  it('suffixes the page title with the site name', async () => {
    const result = await generateMeta({
      doc: { slug: 'for-brands', meta: { title: 'For Brands', description: 'Brand programs' } },
    })
    expect(result.title).toBe('For Brands | Amerikiosks')
    expect(result.description).toBe('Brand programs')
  })

  it('uses the given path as both the OG url and the canonical', async () => {
    const result = await generateMeta({
      doc: { slug: 'my-post', meta: { title: 'My Post' } },
      path: '/es/insights/mi-articulo',
    })
    expect(result.openGraph?.url).toBe('/es/insights/mi-articulo')
    expect(result.alternates?.canonical).toBe('/es/insights/mi-articulo')
  })

  it('emits hreflang alternates only when languages are given', async () => {
    const withLanguages = await generateMeta({
      doc: { slug: 'faq', meta: { title: 'FAQ' } },
      path: '/faq',
      languages: { en: '/faq', es: '/es/faq' },
    })
    expect(withLanguages.alternates?.languages).toEqual({ en: '/faq', es: '/es/faq' })

    // Routes whose slug is translated per locale pass no `languages` — a wrong
    // hreflang is worse than none.
    const withoutLanguages = await generateMeta({
      doc: { slug: 'faq', meta: { title: 'FAQ' } },
      path: '/faq',
    })
    expect(withoutLanguages.alternates?.languages).toBeUndefined()
  })

  it('falls back to the root OG url and emits no canonical when no path is given', async () => {
    const result = await generateMeta({
      doc: { slug: 'faq', meta: { title: 'FAQ' } },
    })
    expect(result.openGraph?.url).toBe('/')
    expect(result.alternates).toBeUndefined()
  })

  it('uses the meta image size when the image is a populated media doc', async () => {
    const result = await generateMeta({
      doc: {
        slug: 'machines',
        meta: {
          title: 'Machines',
          image: {
            id: 1,
            url: '/media/hero.png',
            sizes: { og: { url: '/media/hero-1200x630.png' } },
          } as never,
        },
      },
    })
    const images = result.openGraph?.images as { url: string }[] | undefined
    expect(images?.[0]?.url).toContain('/media/hero-1200x630.png')
  })

  it('falls back to the full image url when no og size is available', async () => {
    const result = await generateMeta({
      doc: {
        slug: 'machines',
        meta: {
          title: 'Machines',
          image: { id: 1, url: '/media/hero.png' } as never,
        },
      },
    })
    const images = result.openGraph?.images as { url: string }[] | undefined
    expect(images?.[0]?.url).toContain('/media/hero.png')
  })

  it('falls back to a raster default OG image when meta.image is absent', async () => {
    const result = await generateMeta({
      doc: { slug: 'machines', meta: { title: 'Machines' } },
    })
    const images = result.openGraph?.images as { url: string }[] | undefined
    // Must not be an SVG: social crawlers don't render them, so an SVG fallback
    // is the same as having no preview image.
    expect(images?.[0]?.url).toContain('/og-default.png')
    expect(images?.[0]?.url).not.toContain('.svg')
  })
})

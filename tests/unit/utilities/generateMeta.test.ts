import { describe, expect, it } from 'vitest'
import { generateMeta } from '@/utilities/generateMeta'

describe('generateMeta', () => {
  it('falls back to the site default title when doc is null', async () => {
    const result = await generateMeta({ doc: null })
    expect(result.title).toBe('Amerikiosks')
    expect(result.description).toBeUndefined()
  })

  // Only when there is genuinely nothing to say. A document with a title has
  // one, and the site name alone is what made several production pages
  // indistinguishable from each other.
  it('falls back to the site default title only when the doc has no title either', async () => {
    const result = await generateMeta({ doc: { slug: 'no-meta' } })
    expect(result.title).toBe('Amerikiosks')
  })

  it("uses the document's own title when meta.title is empty", async () => {
    const result = await generateMeta({ doc: { slug: 'no-meta', title: 'End-to-end operation' } })
    expect(result.title).toBe('End-to-end operation | Amerikiosks')
  })

  // Machines and machine families are titled by `name`, everything else by
  // `title` — the same pair the SEO plugin's generateTitle handles.
  it('uses `name` for the collections titled that way', async () => {
    const result = await generateMeta({ doc: { slug: 'gamma-10', name: 'Gamma 10' } as never })
    expect(result.title).toBe('Gamma 10 | Amerikiosks')
  })

  it('prefers an explicit meta.title over the document title', async () => {
    const result = await generateMeta({
      doc: { slug: 'x', title: 'Internal name', meta: { title: 'What the visitor sees' } },
    })
    expect(result.title).toBe('What the visitor sees | Amerikiosks')
  })

  // An empty string is what an editor leaves behind by clearing the field, and
  // it must behave like missing rather than producing " | Amerikiosks".
  it('treats an empty meta.title as missing', async () => {
    const result = await generateMeta({
      doc: { slug: 'x', title: 'Real title', meta: { title: '' } },
    })
    expect(result.title).toBe('Real title | Amerikiosks')
  })

  it('carries the fallback into the OpenGraph title too', async () => {
    const result = await generateMeta({ doc: { slug: 'x', title: 'Shared everywhere' } })
    expect(result.openGraph?.title).toBe('Shared everywhere | Amerikiosks')
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

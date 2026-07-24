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

  it('joins array slugs into a single OG url path', async () => {
    const result = await generateMeta({
      doc: { slug: ['insights', 'my-post'], meta: { title: 'My Post' } } as never,
    })
    expect(result.openGraph?.url).toBe('insights/my-post')
  })

  it('falls back to the root OG url path for a string slug', async () => {
    const result = await generateMeta({
      doc: { slug: 'faq', meta: { title: 'FAQ' } },
    })
    expect(result.openGraph?.url).toBe('/')
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

  it('falls back to the default OG image when meta.image is absent', async () => {
    const result = await generateMeta({
      doc: { slug: 'machines', meta: { title: 'Machines' } },
    })
    const images = result.openGraph?.images as { url: string }[] | undefined
    expect(images?.[0]?.url).toContain('/logos/logo-1.svg')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

const redirect = vi.fn()
const notFound = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args),
  notFound: (...args: unknown[]) => notFound(...args),
}))

const getCachedRedirects = vi.fn()
vi.mock('@/utilities/getRedirects', () => ({
  getCachedRedirects: () => getCachedRedirects,
}))

const getCachedDocumentInner = vi.fn()
const getCachedDocument = vi.fn((_collection: string, _id: string) => getCachedDocumentInner)
vi.mock('@/utilities/getDocument', () => ({
  getCachedDocument: (collection: string, id: string) => getCachedDocument(collection, id),
}))

import { PayloadRedirects } from '@/components/PayloadRedirects'

describe('PayloadRedirects', () => {
  afterEach(() => {
    redirect.mockClear()
    notFound.mockClear()
    getCachedRedirects.mockReset()
    getCachedDocument.mockReset()
  })

  it('redirects to a custom URL when a matching redirect has a "to.url"', async () => {
    getCachedRedirects.mockResolvedValue([{ from: '/old', to: { url: '/new' } }])

    await PayloadRedirects({ url: '/old' })

    expect(redirect).toHaveBeenCalledWith('/new')
  })

  it('resolves a reference redirect to a page and redirects to its slug', async () => {
    getCachedRedirects.mockResolvedValue([
      {
        from: '/old-page',
        to: { reference: { relationTo: 'pages', value: { slug: 'new-page' } } },
      },
    ])

    await PayloadRedirects({ url: '/old-page' })

    expect(redirect).toHaveBeenCalledWith('/new-page')
  })

  it('resolves a reference redirect to an insight with the /insights prefix', async () => {
    getCachedRedirects.mockResolvedValue([
      {
        from: '/old-post',
        to: { reference: { relationTo: 'insights', value: { slug: 'new-post' } } },
      },
    ])

    await PayloadRedirects({ url: '/old-post' })

    expect(redirect).toHaveBeenCalledWith('/insights/new-post')
  })

  it('resolves an unpopulated reference id via getCachedDocument', async () => {
    getCachedRedirects.mockResolvedValue([
      {
        from: '/old-page',
        to: { reference: { relationTo: 'pages', value: 'page-id-1' } },
      },
    ])
    getCachedDocumentInner.mockResolvedValue({ slug: 'resolved-page' })

    await PayloadRedirects({ url: '/old-page' })

    expect(getCachedDocument).toHaveBeenCalledWith('pages', 'page-id-1')
    expect(redirect).toHaveBeenCalledWith('/resolved-page')
  })

  it('calls notFound when no redirect matches and disableNotFound is false', async () => {
    getCachedRedirects.mockResolvedValue([])

    await PayloadRedirects({ url: '/missing' })

    expect(notFound).toHaveBeenCalled()
  })

  it('returns null instead of calling notFound when disableNotFound is true', async () => {
    getCachedRedirects.mockResolvedValue([])

    const result = await PayloadRedirects({ url: '/missing', disableNotFound: true })

    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

describe('revalidatePage / revalidateDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busts the redirects tag on publish — a stale redirect must not keep shadowing the newly published page', async () => {
    const { revalidatePage } = await import('@/collections/Pages/hooks/revalidatePage')

    const doc = { slug: 'about', _status: 'published' }
    const info = vi.fn()

    revalidatePage({
      doc,
      previousDoc: { slug: 'about', _status: 'draft' },
      req: { payload: { logger: { info } }, context: {}, locale: 'en' },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
  })

  it('busts the redirects tag on unpublish — a redirect for this slug becomes live again', async () => {
    const { revalidatePage } = await import('@/collections/Pages/hooks/revalidatePage')

    const doc = { slug: 'about', _status: 'draft' }
    const info = vi.fn()

    revalidatePage({
      doc,
      previousDoc: { slug: 'about', _status: 'published' },
      req: { payload: { logger: { info } }, context: {}, locale: 'en' },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
  })

  it('busts the redirects tag on delete — deleting a page frees its slug for a redirect', async () => {
    const { revalidateDelete } = await import('@/collections/Pages/hooks/revalidatePage')

    const doc = { slug: 'about' }

    revalidateDelete({
      doc,
      req: { context: {}, locale: 'en' },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
  })

  it('does not revalidate anything when context.disableRevalidate is true', async () => {
    const { revalidatePage, revalidateDelete } = await import(
      '@/collections/Pages/hooks/revalidatePage'
    )

    revalidatePage({
      doc: { slug: 'about', _status: 'published' },
      previousDoc: { slug: 'about', _status: 'draft' },
      req: {
        payload: { logger: { info: vi.fn() } },
        context: { disableRevalidate: true },
        locale: 'en',
      },
    } as never)

    revalidateDelete({
      doc: { slug: 'about' },
      req: { context: { disableRevalidate: true }, locale: 'en' },
    } as never)

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

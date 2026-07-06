import { describe, expect, it, vi } from 'vitest'
import { beforeSyncWithSearch } from '@/search/beforeSync'

const baseSearchDoc = { doc: { relationTo: 'insights', value: 1 } } as never

describe('beforeSyncWithSearch', () => {
  it('falls back to the doc title when meta.title is empty', async () => {
    const result = await beforeSyncWithSearch({
      req: {} as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: {} },
      searchDoc: baseSearchDoc,
    } as never)

    expect(result.meta?.title).toBe('My Post')
    expect(result.slug).toBe('my-post')
  })

  it('prefers meta.title when present', async () => {
    const result = await beforeSyncWithSearch({
      req: {} as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: { title: 'SEO Title' } },
      searchDoc: baseSearchDoc,
    } as never)

    expect(result.meta?.title).toBe('SEO Title')
  })

  it('extracts the media id when meta.image is a populated object', async () => {
    const result = await beforeSyncWithSearch({
      req: {} as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: { image: { id: 42 } } },
      searchDoc: baseSearchDoc,
    } as never)

    expect(result.meta?.image).toBe(42)
  })

  it('sets categories to an empty array when there are none', async () => {
    const result = await beforeSyncWithSearch({
      req: {} as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: {}, categories: [] },
      searchDoc: baseSearchDoc,
    } as never)

    expect(result.categories).toEqual([])
  })

  it('uses already-populated category objects without calling findByID', async () => {
    const findByID = vi.fn()
    const result = await beforeSyncWithSearch({
      req: { payload: { findByID } } as never,
      originalDoc: {
        slug: 'my-post',
        title: 'My Post',
        meta: {},
        categories: [{ id: 'cat-1', title: 'Retail' }],
      },
      searchDoc: baseSearchDoc,
    } as never)

    expect(findByID).not.toHaveBeenCalled()
    expect(result.categories).toEqual([
      { relationTo: 'categories', categoryID: 'cat-1', title: 'Retail' },
    ])
  })

  it('resolves un-populated category IDs via findByID', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 'cat-2', title: 'Brands' })
    const result = await beforeSyncWithSearch({
      req: { payload: { findByID } } as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: {}, categories: ['cat-2'] },
      searchDoc: baseSearchDoc,
    } as never)

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'categories', id: 'cat-2' }),
    )
    expect(result.categories).toEqual([
      { relationTo: 'categories', categoryID: 'cat-2', title: 'Brands' },
    ])
  })

  it('skips categories that resolve to null without throwing', async () => {
    const findByID = vi.fn().mockResolvedValue(null)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await beforeSyncWithSearch({
      req: { payload: { findByID } } as never,
      originalDoc: { slug: 'my-post', title: 'My Post', meta: {}, categories: ['missing-cat'] },
      searchDoc: baseSearchDoc,
    } as never)

    expect(result.categories).toEqual([])
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

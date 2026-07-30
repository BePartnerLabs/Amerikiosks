import { beforeEach, describe, expect, it, vi } from 'vitest'
import { populateAuthors } from '@/collections/Insights/hooks/populateAuthors'

describe('populateAuthors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('batches all authors into a single find() call, with req passed through for transaction safety', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ],
    })
    const req = { payload: { find } }

    const doc = { authors: [1, { id: 2 }] }

    await populateAuthors({ doc, req } as never)

    // Guards the N+1 -> single batched query fix: exactly one call, not one per author.
    expect(find).toHaveBeenCalledTimes(1)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        where: { id: { in: [1, 2] } },
        req,
      }),
    )
  })

  it('populates doc.populatedAuthors with { id, name } for each found user', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ],
    })
    const req = { payload: { find } }

    const doc = { authors: [1, 2] }
    const result = await populateAuthors({ doc, req } as never)

    expect(result.populatedAuthors).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ])
  })

  it('does not query at all when there are no authors', async () => {
    const find = vi.fn()
    const req = { payload: { find } }

    const doc = { authors: [] }
    const result = await populateAuthors({ doc, req } as never)

    expect(find).not.toHaveBeenCalled()
    expect(result).toBe(doc)
    expect(result.populatedAuthors).toBeUndefined()
  })

  it('swallows a rejected find() and returns the doc unchanged rather than throwing', async () => {
    const find = vi.fn().mockRejectedValue(new Error('db down'))
    const req = { payload: { find } }

    const doc = { authors: [1] }

    await expect(populateAuthors({ doc, req } as never)).resolves.toBe(doc)
    expect((doc as { populatedAuthors?: unknown }).populatedAuthors).toBeUndefined()
  })
})

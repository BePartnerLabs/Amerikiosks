import { describe, expect, it } from 'vitest'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

type Args = Parameters<typeof populatePublishedAt>[0]

const makeArgs = (overrides: Partial<Args>): Args =>
  ({
    data: { title: 'Example' },
    operation: 'create',
    req: { data: {} },
    ...overrides,
  }) as unknown as Args

describe('populatePublishedAt', () => {
  it('sets publishedAt on create when not already provided', () => {
    const result = populatePublishedAt(makeArgs({ operation: 'create' }))
    expect(result.publishedAt).toBeInstanceOf(Date)
  })

  it('sets publishedAt on update when not already provided', () => {
    const result = populatePublishedAt(makeArgs({ operation: 'update' }))
    expect(result.publishedAt).toBeInstanceOf(Date)
  })

  it('does not overwrite an existing publishedAt value', () => {
    const existing = new Date('2020-01-01')
    const result = populatePublishedAt(
      makeArgs({
        operation: 'update',
        req: { data: { publishedAt: existing } },
      } as unknown as Partial<Args>),
    )
    expect(result.publishedAt).toBeUndefined()
  })

  it('leaves data unchanged for other operations', () => {
    const result = populatePublishedAt(
      makeArgs({ operation: 'delete' } as unknown as Partial<Args>),
    )
    expect(result.publishedAt).toBeUndefined()
  })
})

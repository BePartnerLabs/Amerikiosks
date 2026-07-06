import { describe, expect, it } from 'vitest'
import { formatAuthors } from '@/utilities/formatAuthors'

type AuthorLike = { name?: string | null }

describe('formatAuthors', () => {
  it('returns an empty string for an empty array', () => {
    expect(formatAuthors([] as AuthorLike[] as never)).toBe('')
  })

  it('returns the single name for one author', () => {
    expect(formatAuthors([{ name: 'Ada' }] as AuthorLike[] as never)).toBe('Ada')
  })

  it('joins two authors with "and"', () => {
    expect(formatAuthors([{ name: 'Ada' }, { name: 'Grace' }] as AuthorLike[] as never)).toBe(
      'Ada and Grace',
    )
  })

  it('joins three or more authors with commas and a final "and" (no Oxford comma)', () => {
    expect(
      formatAuthors([
        { name: 'Ada' },
        { name: 'Grace' },
        { name: 'Margaret' },
      ] as AuthorLike[] as never),
    ).toBe('Ada, Grace and Margaret')
  })

  it('filters out authors without a name', () => {
    expect(
      formatAuthors([
        { name: 'Ada' },
        { name: undefined },
        { name: 'Grace' },
      ] as AuthorLike[] as never),
    ).toBe('Ada and Grace')
  })
})

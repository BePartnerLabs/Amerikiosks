import { describe, expect, it } from 'vitest'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'
import { validateMondayColumnId } from '@/utilities/detectMondayDrift'

const cache: MondayBoardsCache = {
  syncedAt: '2026-07-25T00:00:00.000Z',
  boards: [
    {
      id: '4042731281',
      name: 'Contact Us - AK',
      groups: [],
      columns: [
        { id: 'email', title: 'Email', type: 'email' },
        { id: 'phone', title: 'Phone', type: 'phone' },
        { id: 'name', title: 'Name', type: 'name' },
      ],
    },
  ],
}

describe('validateMondayColumnId', () => {
  it('passes when the value is empty (field opted out of sync)', () => {
    expect(validateMondayColumnId('', '4042731281', cache)).toBe(true)
    expect(validateMondayColumnId(undefined, '4042731281', cache)).toBe(true)
  })

  it('passes when no board id is set yet', () => {
    expect(validateMondayColumnId('email', undefined, cache)).toBe(true)
  })

  it('passes when there is no cache yet (fails open)', () => {
    expect(validateMondayColumnId('email', '4042731281', undefined)).toBe(true)
  })

  it('passes when the board id is not found in the cache (fails open)', () => {
    expect(validateMondayColumnId('email', '999', cache)).toBe(true)
  })

  it('passes when the column id exists on the selected board', () => {
    expect(validateMondayColumnId('email', '4042731281', cache)).toBe(true)
  })

  it('returns an error message when the column id does not exist on the selected board', () => {
    const result = validateMondayColumnId('deleted_col', '4042731281', cache)
    expect(result).not.toBe(true)
    expect(result).toContain('deleted_col')
    expect(result).toContain('Contact Us - AK')
  })

  it('passes when no fieldBlockType is given, even for a mismatched column type', () => {
    expect(validateMondayColumnId('email', '4042731281', cache)).toBe(true)
  })

  it('passes when the column type is compatible with the field blockType', () => {
    expect(validateMondayColumnId('email', '4042731281', cache, 'email')).toBe(true)
  })

  it('returns an error when the column type is incompatible with the field blockType', () => {
    const result = validateMondayColumnId('email', '4042731281', cache, 'number')
    expect(result).not.toBe(true)
    expect(result).toContain('email')
    expect(result).toContain('number')
  })

  it('fails open for a blockType with no known compatibility list', () => {
    expect(validateMondayColumnId('email', '4042731281', cache, 'unknown-type')).toBe(true)
  })

  it('passes a "phone" column for a "text" field', () => {
    expect(validateMondayColumnId('phone', '4042731281', cache, 'text')).toBe(true)
  })

  it("passes Monday's name pseudo-column, which maps to the item title rather than a column", () => {
    expect(validateMondayColumnId('name', '4042731281', cache, 'text')).toBe(true)
  })
})

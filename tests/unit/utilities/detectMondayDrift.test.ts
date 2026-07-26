import { describe, expect, it } from 'vitest'
import { detectMondayDrift, type MondayBoardsCache } from '@/utilities/detectMondayDrift'

const cache: MondayBoardsCache = {
  syncedAt: '2026-07-25T00:00:00.000Z',
  boards: [
    {
      id: '4042731281',
      name: 'Contact Us - AK',
      groups: [{ id: 'topics', title: 'Group Title' }],
      columns: [
        { id: 'text', title: 'Name', type: 'name' },
        { id: 'email', title: 'Email', type: 'email' },
        { id: 'phone', title: 'Phone', type: 'phone' },
      ],
    },
  ],
}

describe('detectMondayDrift', () => {
  it('reports boardFound: false and no missing columns when there is no cache', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: 'email' }] },
      undefined,
    )
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports boardFound: false when the form has no board id set', () => {
    const result = detectMondayDrift({ externalId: null, fields: [{ externalId: 'email' }] }, cache)
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports boardFound: false when the board id is not in the cache', () => {
    const result = detectMondayDrift(
      { externalId: '999', fields: [{ externalId: 'email' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports no missing columns when every field externalId exists on the board', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: 'email' }, { externalId: 'phone' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: [] })
  })

  it('reports missing column ids that no longer exist on the board', () => {
    const result = detectMondayDrift(
      {
        externalId: '4042731281',
        fields: [{ externalId: 'email' }, { externalId: 'deleted_column' }],
      },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: ['deleted_column'] })
  })

  it('ignores fields with no externalId set', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: undefined }, { externalId: 'email' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: [] })
  })
})

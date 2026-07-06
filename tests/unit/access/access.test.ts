import { describe, expect, it } from 'vitest'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

describe('anyone', () => {
  it('always returns true', () => {
    expect(anyone({} as never)).toBe(true)
  })
})

describe('authenticated', () => {
  it('returns true when a user is present', () => {
    expect(authenticated({ req: { user: { id: 1 } } } as never)).toBe(true)
  })

  it('returns false when there is no user', () => {
    expect(authenticated({ req: { user: null } } as never)).toBe(false)
  })
})

describe('authenticatedOrPublished', () => {
  it('returns true when a user is present', () => {
    expect(authenticatedOrPublished({ req: { user: { id: 1 } } } as never)).toBe(true)
  })

  it('returns a published-only query constraint when there is no user', () => {
    expect(authenticatedOrPublished({ req: { user: null } } as never)).toEqual({
      _status: { equals: 'published' },
    })
  })
})

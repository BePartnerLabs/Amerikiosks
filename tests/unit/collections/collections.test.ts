import { describe, expect, it } from 'vitest'
import { Brands } from '@/collections/Brands'
import { Categories } from '@/collections/Categories'
import { Claims } from '@/collections/Claims'
import { FAQItems } from '@/collections/FAQItems'
import { Insights } from '@/collections/Insights'
import { Machines } from '@/collections/Machines'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Partners } from '@/collections/Partners'
import { Projects } from '@/collections/Projects'
import { Users } from '@/collections/Users'

describe('collection configs', () => {
  it('Pages has the expected slug and a non-empty field list', () => {
    expect(Pages.slug).toBe('pages')
    expect(Pages.fields.length).toBeGreaterThan(0)
  })

  it('Insights has the expected slug and a non-empty field list', () => {
    expect(Insights.slug).toBe('insights')
    expect(Insights.fields.length).toBeGreaterThan(0)
  })

  it('Machines has the expected slug and a non-empty field list', () => {
    expect(Machines.slug).toBe('machines')
    expect(Machines.fields.length).toBeGreaterThan(0)
  })

  it('FAQItems has the expected slug and a non-empty field list', () => {
    expect(FAQItems.slug).toBe('faqItems')
    expect(FAQItems.fields.length).toBeGreaterThan(0)
  })

  it('Projects has the expected slug and a non-empty field list', () => {
    expect(Projects.slug).toBe('projects')
    expect(Projects.fields.length).toBeGreaterThan(0)
  })

  it('Users has the expected slug and auth enabled', () => {
    expect(Users.slug).toBe('users')
    expect(Users.auth).toBeTruthy()
  })

  it('Categories has the expected slug and a non-empty field list', () => {
    expect(Categories.slug).toBe('categories')
    expect(Categories.fields.length).toBeGreaterThan(0)
  })

  it('Partners has the expected slug and a non-empty field list', () => {
    expect(Partners.slug).toBe('partners')
    expect(Partners.fields.length).toBeGreaterThan(0)
  })

  it('Media has the expected slug and a non-empty field list', () => {
    expect(Media.slug).toBe('media')
    expect(Media.fields.length).toBeGreaterThan(0)
  })

  it('Brands has the expected slug, public read, and a non-empty field list', () => {
    expect(Brands.slug).toBe('brands')
    expect(Brands.fields.length).toBeGreaterThan(0)
    expect(Brands.access?.read).toBeDefined()
  })

  it('Claims has the expected slug and access: REST create closed, authenticated read/update/delete', () => {
    expect(Claims.slug).toBe('claims')
    expect(Claims.fields.length).toBeGreaterThan(0)

    const fakeUnauthedReq = { req: { user: null } } as never
    const fakeAuthedReq = { req: { user: { id: '1' } } } as never

    expect(Claims.access?.create).toBeDefined()
    expect(Claims.access?.read).toBeDefined()
    expect(Claims.access?.update).toBeDefined()
    expect(Claims.access?.delete).toBeDefined()

    // create is closed even for authenticated users: anonymous kiosk submissions
    // go exclusively through /next/claims-submit (rate limit, photo sniffing,
    // size cap), which creates via the Local API's default overrideAccess.
    // A public REST create would bypass all of that and still fire the Monday sync.
    expect(Claims.access?.create?.(fakeUnauthedReq)).toBe(false)
    expect(Claims.access?.create?.(fakeAuthedReq)).toBe(false)
    // read/update/delete must require an authenticated staff user
    expect(Claims.access?.read?.(fakeUnauthedReq)).toBe(false)
    expect(Claims.access?.read?.(fakeAuthedReq)).toBe(true)
  })
})

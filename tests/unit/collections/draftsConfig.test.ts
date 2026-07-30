import { describe, expect, it } from 'vitest'
import { Brands } from '@/collections/Brands'
import { Insights } from '@/collections/Insights'
import { MachineFamilies } from '@/collections/MachineFamilies'
import { Machines } from '@/collections/Machines'
import { Pages } from '@/collections/Pages'
import { Projects } from '@/collections/Projects'

// Every drafts-enabled collection in this project. Add a newly created
// drafts-enabled collection to this table — that's the only change needed
// to cover it under both invariants below.
const draftsEnabledCollections = [
  { name: 'Pages', collection: Pages },
  { name: 'Insights', collection: Insights },
  { name: 'Machines', collection: Machines },
  { name: 'Projects', collection: Projects },
  { name: 'MachineFamilies', collection: MachineFamilies },
  { name: 'Brands', collection: Brands },
]

describe('drafts config: no autosave', () => {
  // The Payload website template ships `autosave: { interval: 100 }`, which
  // wrote a version row every 100ms while typing. We removed it everywhere.
  // If someone copies template code back in, this catches the regression.
  it.each(draftsEnabledCollections)('$name versions.drafts has no autosave', ({ collection }) => {
    // `versions` is typed `boolean | IncomingCollectionVersions`; every
    // collection here sets the object form, so narrow before reading `drafts`.
    const versions = collection.versions
    const drafts = typeof versions === 'object' ? versions.drafts : undefined

    expect(drafts).toBeTruthy()

    if (typeof drafts === 'object') {
      expect(drafts).not.toHaveProperty('autosave')
    }
  })
})

describe('drafts config: not world-readable', () => {
  // A collection with drafts and `read: anyone` leaks unpublished documents.
  // This was a real finding — Machines, Projects, and MachineFamilies had it.
  // `authenticatedOrPublished` returns a query constraint (not `true`) for an
  // anonymous request, and `true` only for an authenticated one.
  it.each(draftsEnabledCollections)(
    '$name access.read denies anonymous requests and allows authenticated ones',
    ({ collection }) => {
      const read = collection.access?.read

      expect(read).toBeDefined()

      const anonymousResult = read?.({ req: { user: null } } as never)
      const authenticatedResult = read?.({ req: { user: { id: 1 } } } as never)

      expect(anonymousResult).not.toBe(true)
      expect(authenticatedResult).toBe(true)
    },
  )
})

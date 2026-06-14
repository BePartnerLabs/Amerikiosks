import type { Payload, PayloadRequest } from 'payload'
import { seedAudiencePages, seedWhoItsFor } from './audience'
import { seedCaseStudies } from './case-studies'
import { seedContact } from './contact'
import { seedForAgencies } from './for-agencies'
import { seedForBrands } from './for-brands'
import { seedForEmergingBrands } from './for-emerging-brands'
import { seedForVenues } from './for-venues'
import { seedHome } from './home'
import { seedSolutions } from './solutions'
import { seedWhereItWorks } from './where-it-works'
import { seedWhyAmerikiosks } from './why-amerikiosks'

export const seedPages = async (
  payload: Payload,
  req: PayloadRequest,
  { postIds = [] }: { postIds?: string[] } = {},
): Promise<void> => {
  // Delete ALL children of who-its-for before touching the parent so Nested Docs never
  // re-saves a stale mediumImpact child that has no hero.media.
  const whoItsForParent = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'who-its-for' } },
    limit: 1,
    locale: 'en',
    overrideAccess: true,
    req: { ...req, locale: 'en' } as PayloadRequest,
  })
  if (whoItsForParent.docs.length > 0) {
    const parentId = whoItsForParent.docs[0]?.id
    const children = await payload.find({
      collection: 'pages',
      where: { parent: { equals: parentId } },
      limit: 100,
      locale: 'en',
      overrideAccess: true,
      req: { ...req, locale: 'en' } as PayloadRequest,
    })
    for (const child of children.docs) {
      await payload.delete({
        collection: 'pages',
        id: child.id,
        req,
        overrideAccess: true,
      })
    }
  }

  // seedWhoItsFor first — parent page must exist before seedForBrands sets parent FK
  // seedForBrands before seedAudiencePages — so audience loop finds for-brands and skips stub
  // (avoids stale FK in seedHome when seedForBrands deletes+recreates the page)
  const whoItsForId = await seedWhoItsFor(payload, req)
  await seedForBrands(payload, req)
  await seedForVenues(payload, req)
  await seedForAgencies(payload, req)
  await seedForEmergingBrands(payload, req)
  const { pageIds, mediaIds } = await seedAudiencePages(payload, req, whoItsForId)
  await seedHome(payload, req, pageIds, postIds, mediaIds)
  await seedSolutions(payload, req)
  await seedWhereItWorks(payload, req)
  await seedCaseStudies(payload, req)
  await seedWhyAmerikiosks(payload, req)
  await seedContact(payload, req)
}

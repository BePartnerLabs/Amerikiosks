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
  // Delete for-brands before seeding the parent so nested-docs never re-saves a stale
  // mediumImpact child that has no hero.media (left over from a previous broken seed run).
  const staleForBrands = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'for-brands' } },
    limit: 1,
    overrideAccess: true,
    req,
  })
  if (staleForBrands.docs.length > 0) {
    await payload.delete({
      collection: 'pages',
      id: staleForBrands.docs[0]?.id,
      req,
      overrideAccess: true,
    })
  }

  for (const slug of ['for-venues', 'for-agencies', 'for-emerging-brands']) {
    const stale = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
      req,
    })
    if (stale.docs.length > 0) {
      await payload.delete({
        collection: 'pages',
        id: stale.docs[0]?.id,
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

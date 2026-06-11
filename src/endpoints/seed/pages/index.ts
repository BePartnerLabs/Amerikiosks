import type { Payload, PayloadRequest } from 'payload'
import { seedAudiencePages, seedWhoItsFor } from './audience'
import { seedCaseStudies } from './case-studies'
import { seedContact } from './contact'
import { seedForBrands } from './for-brands'
import { seedHome } from './home'
import { seedSolutions } from './solutions'
import { seedWhereItWorks } from './where-it-works'
import { seedWhyAmerikiosks } from './why-amerikiosks'

export const seedPages = async (
  payload: Payload,
  req: PayloadRequest,
  { postIds = [] }: { postIds?: string[] } = {},
): Promise<void> => {
  // seedWhoItsFor first — parent page must exist before seedForBrands sets parent FK
  // seedForBrands before seedAudiencePages — so audience loop finds for-brands and skips stub
  // (avoids stale FK in seedHome when seedForBrands deletes+recreates the page)
  const whoItsForId = await seedWhoItsFor(payload, req)
  await seedForBrands(payload, req)
  const { pageIds, mediaIds } = await seedAudiencePages(payload, req, whoItsForId)
  await seedHome(payload, req, pageIds, postIds, mediaIds)
  await seedSolutions(payload, req)
  await seedWhereItWorks(payload, req)
  await seedCaseStudies(payload, req)
  await seedWhyAmerikiosks(payload, req)
  await seedContact(payload, req)
}

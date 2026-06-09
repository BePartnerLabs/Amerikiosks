import type { Payload, PayloadRequest } from 'payload'
import { seedAudiencePages } from './audience'
import { seedCaseStudies } from './case-studies'
import { seedContact } from './contact'
import { seedHome } from './home'
import { seedSolutions } from './solutions'
import { seedWhereItWorks } from './where-it-works'
import { seedWhyAmerikiosks } from './why-amerikiosks'

export const seedPages = async (
  payload: Payload,
  req: PayloadRequest,
  { postIds = [] }: { postIds?: string[] } = {},
): Promise<void> => {
  const { pageIds, mediaIds } = await seedAudiencePages(payload, req)
  await seedHome(payload, req, pageIds, postIds, mediaIds)
  await seedSolutions(payload, req)
  await seedWhereItWorks(payload, req)
  await seedCaseStudies(payload, req)
  await seedWhyAmerikiosks(payload, req)
  await seedContact(payload, req)
}

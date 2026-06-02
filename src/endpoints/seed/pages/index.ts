import type { Payload, PayloadRequest } from 'payload'
import { seedCaseStudies } from './case-studies'
import { seedContact } from './contact'
import { seedHome } from './home'
import { seedSolutions } from './solutions'
import { seedWhereItWorks } from './where-it-works'
import { seedWhyAmerikiosks } from './why-amerikiosks'

export const seedPages = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  await seedHome(payload, req)
  await seedSolutions(payload, req)
  await seedWhereItWorks(payload, req)
  await seedCaseStudies(payload, req)
  await seedWhyAmerikiosks(payload, req)
  await seedContact(payload, req)
}

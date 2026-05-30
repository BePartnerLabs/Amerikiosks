import type { Payload, PayloadRequest } from 'payload'

import { seedHome } from './home'
import { seedSolutions } from './solutions'
import { seedWhereItWorks } from './where-it-works'
import { seedCaseStudies } from './case-studies'
import { seedWhyAmerikiosks } from './why-amerikiosks'

export const seedPages = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  await seedHome(payload, req)
  await seedSolutions(payload, req)
  await seedWhereItWorks(payload, req)
  await seedCaseStudies(payload, req)
  await seedWhyAmerikiosks(payload, req)
}

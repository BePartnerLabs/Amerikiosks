import type { Payload, PayloadRequest } from 'payload'

import { seedFooter } from './footer'
import { seedHeader } from './header'
import { seedPages } from './pages'

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  await seedPages(payload, req)
  await seedHeader(payload, req)
  await seedFooter(payload, req)

  payload.logger.info('Seeded database successfully!')
}

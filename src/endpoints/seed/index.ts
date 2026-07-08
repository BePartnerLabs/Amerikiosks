import type { Payload, PayloadRequest } from 'payload'

import { seedBrands } from './brands'
import { seedFooter } from './footer'
import { seedHeader } from './header'
import { seedPosts } from './insights'
import { seedPages } from './pages'
import { seedPartners } from './partners'
import { seedRedirects } from './redirects'
import { seedSettings } from './settings'

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  const postIds = await seedPosts(payload, req)
  await seedBrands(payload, req)
  await seedPages(payload, req, { postIds })
  await seedHeader(payload, req)
  await seedFooter(payload, req)
  await seedPartners(payload, req)
  await seedSettings(payload, req)
  await seedRedirects(payload, req)

  payload.logger.info('Seeded database successfully!')
}

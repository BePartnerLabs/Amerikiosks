import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedWhereItWorks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding where-it-works page...')
  await upsertPage(payload, req, { title: 'Where It Works', slug: 'where-it-works' }, { title: 'Dónde Funciona', slug: 'donde-funciona' })
}

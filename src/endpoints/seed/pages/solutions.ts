import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedSolutions = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding solutions page...')
  await upsertPage(payload, req, { title: 'Solutions', slug: 'solutions' }, { title: 'Soluciones', slug: 'solutions' })
}

import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedHome = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding home page...')
  await upsertPage(payload, req, { title: 'Home', slug: 'home' }, { title: 'Inicio', slug: 'home' })
}

import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedWhyAmerikiosks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding why-amerikiosks page...')
  await upsertPage(
    payload,
    req,
    { title: 'Why Amerikiosks', slug: 'why-amerikiosks' },
    { title: 'Por Qué Amerikiosks', slug: 'por-que-amerikiosks' },
  )
}

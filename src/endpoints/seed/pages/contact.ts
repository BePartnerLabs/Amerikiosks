import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedContact = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding contact page...')
  await upsertPage(
    payload,
    req,
    { title: 'Contact', slug: 'contact' },
    { title: 'Contacto', slug: 'contacto' },
  )
}

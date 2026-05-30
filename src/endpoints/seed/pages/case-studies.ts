import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

export const seedCaseStudies = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding case-studies page...')
  await upsertPage(payload, req, { title: 'Case Studies', slug: 'case-studies' }, { title: 'Casos de Éxito', slug: 'case-studies' })
}

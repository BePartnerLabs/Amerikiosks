import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from './uploadMedia'

const PARTNERS = [
  { name: 'Hilton', file: 'partner-hilton.png', order: 1 },
  { name: 'CVS', file: 'partner-cvs.png', order: 2 },
  { name: 'Holiday Inn', file: 'partner-holiday-inn.png', order: 3 },
  { name: 'Kroger', file: 'partner-kroger.png', order: 4 },
  { name: 'Royal Caribbean', file: 'partner-royal-caribbean.png', order: 5 },
  { name: 'Miami International Airport', file: 'partner-mia.png', order: 6 },
]

export const seedPartners = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('Seeding partners...')

  for (const partner of PARTNERS) {
    const logo = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'public/seed-assets', partner.file),
      partner.name,
    )

    await payload.create({
      collection: 'partners',
      data: {
        name: partner.name,
        logo: logo.id,
        order: partner.order,
      },
      req,
    })
  }

  payload.logger.info(`Seeded ${PARTNERS.length} partners.`)
}

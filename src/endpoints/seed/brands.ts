import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from './uploadMedia'

// Kiosk branding options audited live from Amerikiosks' current JotForm
// ("Amerikiosks - Refund Request", form 230405763622148) — see
// docs/analytics-migration-report.md for the full audit.
const BRANDS: { name: string; file?: string }[] = [
  { name: "Carlo's Bakery", file: 'brand-carlos-bakery.png' },
  { name: 'Pharmabox by CVS', file: 'brand-pharmabox.png' },
  { name: 'Fan Stand', file: 'brand-fan-stand.webp' },
  { name: 'iStore', file: 'brand-istore.png' },
  { name: 'Refreshments' },
  { name: 'Snacks' },
  { name: 'Wellness' },
]

export const seedBrands = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding brands...')

  for (const brand of BRANDS) {
    const logo = brand.file
      ? await uploadMedia(
          payload,
          req,
          path.join(process.cwd(), 'public/seed-assets', brand.file),
          brand.name,
        )
      : undefined

    const existing = await payload.find({
      collection: 'brands',
      where: { name: { equals: brand.name } },
      limit: 1,
      req,
    })

    const data = logo ? { name: brand.name, logo: logo.id } : { name: brand.name }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'brands',
        id: existing.docs[0]?.id,
        data,
        req,
      })
    } else {
      await payload.create({
        collection: 'brands',
        data,
        req,
      })
    }
  }

  payload.logger.info(`Seeded ${BRANDS.length} brands.`)
}

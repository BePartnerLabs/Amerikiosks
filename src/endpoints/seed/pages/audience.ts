import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const audiencePages = [
  {
    slug: 'for-brands',
    title: 'For Brands',
    titleEs: 'Para Marcas',
    heroAsset: 'hero-for-brands.png',
    heroAlt: 'Branded kiosk in a retail venue for brand activations',
    description: 'Launch premium physical touchpoints without opening stores.',
    descriptionEs: 'Lanza puntos de contacto físicos premium sin abrir tiendas.',
  },
  {
    slug: 'for-venues',
    title: 'For Venues',
    titleEs: 'Para Venues',
    heroAsset: 'hero-for-venues.jpg',
    heroAlt: 'Amerikiosks kiosk in a premium airport lounge venue',
    description: 'Monetize high-traffic areas without adding staff or friction.',
    descriptionEs: 'Monetiza zonas de alto tráfico sin añadir personal ni fricción.',
  },
  {
    slug: 'for-agencies',
    title: 'For Agencies',
    titleEs: 'Para Agencias',
    heroAsset: 'hero-for-agencies.png',
    heroAlt: 'Amerikiosks kiosk activation on a busy urban street',
    description: 'Turn briefs into measurable retail activations people notice.',
    descriptionEs: 'Convierte briefings en activaciones de retail medibles que la gente nota.',
  },
  {
    slug: 'for-emerging-brands',
    title: 'For Emerging Brands',
    titleEs: 'Para Marcas Emergentes',
    heroAsset: 'hero-for-brands.png',
    heroAlt: 'Emerging brand kiosk launch in a premium venue',
    description: 'Test real-world retail presence before scaling into stores.',
    descriptionEs: 'Prueba tu presencia retail en el mundo real antes de escalar a tiendas.',
  },
]

export type AudienceSeedResult = {
  pageIds: Record<string, string>
  mediaIds: Record<string, number>
}

export const seedAudiencePages = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<AudienceSeedResult> => {
  payload.logger.info('— Seeding audience sub-pages...')

  const pageIds: Record<string, string> = {}
  const mediaIds: Record<string, number> = {}

  for (const page of audiencePages) {
    // If the page already exists (fully seeded by its own seed function), just
    // collect its ID — don't overwrite a richer hero with this stub.
    // Always upload media (idempotent) so mediaIds is always populated
    const heroImage = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), `src/endpoints/seed/assets/${page.heroAsset}`),
      page.heroAlt,
    )

    mediaIds[page.slug] = heroImage.id as number

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      req,
    })

    if (existing.totalDocs > 0) {
      pageIds[page.slug] = String(existing.docs[0]!.id)
      payload.logger.info(`  Audience page exists, skipping stub: ${page.slug}`)
      continue
    }

    const result = await upsertPage(
      payload,
      req,
      {
        title: page.title,
        slug: page.slug,
        hero: { type: 'lowImpact' as const, media: heroImage.id, richText: null },
        layout: [],
        meta: {
          title: `${page.title} — Amerikiosks`,
          description: page.description,
          image: heroImage.id,
        },
      },
      {
        title: page.titleEs,
        slug: page.slug,
        hero: { type: 'lowImpact' as const, links: [] },
        meta: {
          title: `${page.titleEs} — Amerikiosks`,
          description: page.descriptionEs,
          image: heroImage.id,
        },
      },
    )
    pageIds[page.slug] = String(result.id)
  }

  return { pageIds, mediaIds }
}

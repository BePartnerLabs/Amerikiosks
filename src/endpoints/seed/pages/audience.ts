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
    description:
      'Turn high-traffic venues into premium branded retail moments with Amerikiosks kiosk programs.',
    descriptionEs:
      'Convierte venues de alto tráfico en momentos de retail premium de marca con los programas de kiosk de Amerikiosks.',
  },
  {
    slug: 'for-venues',
    title: 'For Venues',
    titleEs: 'Para Venues',
    heroAsset: 'hero-for-venues.jpg',
    heroAlt: 'Amerikiosks kiosk in a premium airport lounge venue',
    description:
      'Add a new revenue stream and elevate the guest experience with curated branded kiosks.',
    descriptionEs:
      'Añade una nueva fuente de ingresos y eleva la experiencia del huésped con kiosks de marca curados.',
  },
  {
    slug: 'for-agencies',
    title: 'For Agencies',
    titleEs: 'Para Agencias',
    heroAsset: 'hero-for-agencies.png',
    heroAlt: 'Amerikiosks kiosk activation on a busy urban street',
    description:
      'Deliver unforgettable retail activations for your brand clients through the Amerikiosks network.',
    descriptionEs:
      'Entrega activaciones de retail inolvidables para tus clientes de marca a través de la red de Amerikiosks.',
  },
  {
    slug: 'for-emerging-brands',
    title: 'For Emerging Brands',
    titleEs: 'Para Marcas Emergentes',
    heroAsset: 'hero-for-brands.png',
    heroAlt: 'Emerging brand kiosk launch in a premium venue',
    description:
      'Launch your brand in premium venues without the overhead of a full retail build-out.',
    descriptionEs:
      'Lanza tu marca en venues premium sin los costos de una apertura retail completa.',
  },
]

export const seedAudiencePages = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<Record<string, string>> => {
  payload.logger.info('— Seeding audience sub-pages...')

  const ids: Record<string, string> = {}

  for (const page of audiencePages) {
    const heroImage = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), `src/endpoints/seed/assets/${page.heroAsset}`),
      page.heroAlt,
    )

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
        layout: [],
        meta: {
          title: `${page.titleEs} — Amerikiosks`,
          description: page.descriptionEs,
          image: heroImage.id,
        },
      },
    )
    ids[page.slug] = String(result.id)
  }

  return ids
}

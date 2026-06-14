import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const audiencePages = [
  {
    slug: 'for-brands',
    slugEs: 'para-marcas',
    title: 'For Brands',
    titleEs: 'Para Marcas',
    heroAsset: 'hero-for-brands.png',
    heroAlt: 'Branded kiosk in a retail venue for brand activations',
    description: 'Launch premium physical touchpoints without opening stores.',
    descriptionEs: 'Lanza puntos de contacto físicos premium sin abrir tiendas.',
  },
  {
    slug: 'for-venues',
    slugEs: 'para-venues',
    title: 'For Venues',
    titleEs: 'Para Venues',
    heroAsset: 'hero-for-venues.jpg',
    heroAlt: 'Amerikiosks kiosk in a premium airport lounge venue',
    description: 'Monetize high-traffic areas without adding staff or friction.',
    descriptionEs: 'Monetiza zonas de alto tráfico sin añadir personal ni fricción.',
  },
  {
    slug: 'for-agencies',
    slugEs: 'para-agencias',
    title: 'For Agencies',
    titleEs: 'Para Agencias',
    heroAsset: 'hero-for-agencies.png',
    heroAlt: 'Amerikiosks kiosk activation on a busy urban street',
    description: 'Turn briefs into measurable retail activations people notice.',
    descriptionEs: 'Convierte briefings en activaciones de retail medibles que la gente nota.',
  },
  {
    slug: 'for-emerging-brands',
    slugEs: 'para-marcas-emergentes',
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
  whoItsForId: number
}

// Idempotent: creates the "Who it's for" parent page only if it doesn't exist.
// Skips on re-seed to avoid NestedDocs re-validating children (highImpact heroes
// require media, but the ES update passes no media → ValidationError on children).
export const seedWhoItsFor = async (payload: Payload, req: PayloadRequest): Promise<number> => {
  payload.logger.info("— Seeding Who it's for parent page...")

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'who-its-for' } },
    limit: 1,
    depth: 0,
    locale: 'en',
    req: { ...req, locale: 'en' } as PayloadRequest,
  })

  if (existing.totalDocs > 0) {
    const id = existing.docs[0]?.id as number
    payload.logger.info("  Who it's for already exists, skipping (id: " + id + ')')
    return id
  }

  const doc = await upsertPage(
    payload,
    req,
    {
      title: "Who it's for",
      slug: 'who-its-for',
      hero: {
        type: 'lowImpact' as const,
        media: null as never,
        richText: null,
      },
      layout: [],
      _status: 'published' as const,
      meta: {
        title: "Who it's for — Amerikiosks",
        description: 'Find the right Amerikiosks solution for your role.',
      },
    },
    {
      title: 'Para quién',
      slug: 'para-quien',
      hero: { type: 'lowImpact' as const, links: [] },
      meta: {
        title: 'Para quién — Amerikiosks',
        description: 'Encuentra la solución Amerikiosks adecuada para tu rol.',
      },
    },
  )
  return doc.id as number
}

export const seedAudiencePages = async (
  payload: Payload,
  req: PayloadRequest,
  whoItsForId: number,
): Promise<AudienceSeedResult> => {
  payload.logger.info('— Seeding audience sub-pages...')

  const pageIds: Record<string, string> = {}
  const mediaIds: Record<string, number> = {}
  const mediaIdByAsset: Record<string, number> = {}

  pageIds['who-its-for'] = String(whoItsForId)

  for (const page of audiencePages) {
    // If the page already exists (fully seeded by its own seed function), just
    // collect its ID — don't overwrite a richer hero with this stub.
    // Always upload media (idempotent) so mediaIds is always populated.
    let heroImageId = mediaIdByAsset[page.heroAsset]

    if (!heroImageId) {
      const heroImage = await uploadMedia(
        payload,
        req,
        path.join(process.cwd(), `src/endpoints/seed/assets/${page.heroAsset}`),
        page.heroAlt,
      )

      heroImageId = heroImage.id as number
      mediaIdByAsset[page.heroAsset] = heroImageId
    }

    mediaIds[page.slug] = heroImageId

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
      req: { ...req, locale: 'en' } as PayloadRequest,
    })

    if (existing.totalDocs > 0) {
      pageIds[page.slug] = String(existing.docs[0]?.id)
      payload.logger.info(`  Audience page exists, skipping stub: ${page.slug}`)
      continue
    }

    const result = await upsertPage(
      payload,
      req,
      {
        title: page.title,
        slug: page.slug,
        parent: whoItsForId,
        hero: {
          type: 'lowImpact' as const,
          media: heroImageId,
          richText: null,
        },
        layout: [],
        meta: {
          title: `${page.title} — Amerikiosks`,
          description: page.description,
          image: heroImageId,
        },
      },
      {
        title: page.titleEs,
        slug: page.slugEs,
        hero: { type: 'lowImpact' as const, links: [] },
        meta: {
          title: `${page.titleEs} — Amerikiosks`,
          description: page.descriptionEs,
          image: heroImageId,
        },
      },
    )
    pageIds[page.slug] = String(result.id)
  }

  return { pageIds, mediaIds, whoItsForId }
}

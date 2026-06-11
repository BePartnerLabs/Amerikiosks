import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from './uploadMedia'

const insightPosts = [
  {
    slug: 'physical-retail-feel-intentional',
    heroAsset: 'image-post1.webp',
    heroAlt: 'Premium kiosk in a high-traffic retail environment',
    en: {
      title: 'What does it really take to make physical retail feel intentional?',
      excerpt:
        'The machine is only the visible layer. Value comes from choosing the right venue, curating the brand moment, and operating the experience so it feels exactly right when people are ready to buy.',
    },
    es: {
      title: '¿Qué se necesita realmente para que el retail físico se sienta intencional?',
      excerpt:
        'La máquina es solo la capa visible. El valor viene de elegir el venue correcto, curar el momento de marca y operar la experiencia para que se sienta exactamente bien cuando la gente está lista para comprar.',
    },
  },
  {
    slug: 'location-matters-more-than-machine',
    heroAsset: 'image-post2.webp',
    heroAlt: 'Branded kiosk placement at an airport transit hub',
    en: {
      title: 'Why does location matter more than the machine?',
      excerpt:
        'Because context shapes intent. Airports, resorts, and venues turn convenience into a branded moment when the offer fits the journey.',
    },
    es: {
      title: '¿Por qué la ubicación importa más que la máquina?',
      excerpt:
        'Porque el contexto define la intención. Aeropuertos, resorts y venues convierten la conveniencia en un momento de marca cuando la oferta encaja con el recorrido.',
    },
  },
  {
    slug: 'automated-retail-feel-premium',
    heroAsset: 'image-post3.webp',
    heroAlt: 'Premium automated retail kiosk with brand wrap',
    en: {
      title: 'Can automated retail feel premium?',
      excerpt:
        'Yes, when the offer, hardware, placement, and upkeep are curated to match the standard of the space around it.',
    },
    es: {
      title: '¿Puede el retail automatizado sentirse premium?',
      excerpt:
        'Sí, cuando la oferta, el hardware, la ubicación y el mantenimiento están curados para estar a la altura del espacio que lo rodea.',
    },
  },
  {
    slug: 'end-to-end-operation',
    heroAsset: 'image-post4.webp',
    heroAlt: 'Amerikiosks end-to-end retail operation',
    en: {
      title: 'What does end-to-end operation include?',
      excerpt:
        'Fully branded kiosks, merchandising, replenishment, payments, telemetry, and support. Without asking venue staff to be the partner team.',
    },
    es: {
      title: '¿Qué incluye la operación de extremo a extremo?',
      excerpt:
        'Kiosks totalmente personalizados, merchandising, reabastecimiento, pagos, telemetría y soporte. Sin pedirle al personal del venue que sea el equipo socio.',
    },
  },
]

function simpleRichText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export const seedPosts = async (payload: Payload, req: PayloadRequest): Promise<string[]> => {
  payload.logger.info('— Seeding insight posts...')

  const ids: string[] = []

  for (const post of insightPosts) {
    const heroImage = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), `src/endpoints/seed/assets/${post.heroAsset}`),
      post.heroAlt,
    )

    const existing = await payload.find({
      collection: 'insights',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })

    const enData = {
      title: post.en.title,
      slug: post.slug,
      _status: 'published' as const,
      heroImage: heroImage.id,
      content: simpleRichText(post.en.excerpt),
      publishedAt: new Date().toISOString(),
      featured: true,
      meta: { image: heroImage.id, description: post.en.excerpt },
    }

    const doc =
      existing.docs.length > 0
        ? await payload.update({
            collection: 'insights',
            id: existing.docs[0]!.id,
            locale: 'en',
            data: enData,
            req: { ...req, locale: 'en' } as PayloadRequest,
          })
        : await payload.create({
            collection: 'insights',
            locale: 'en',
            data: enData,
            req: { ...req, locale: 'en' } as PayloadRequest,
          })

    await payload.update({
      collection: 'insights',
      id: doc.id,
      locale: 'es',
      data: {
        title: post.es.title,
        slug: post.slug,
        content: simpleRichText(post.es.excerpt),
        meta: { image: heroImage.id, description: post.es.excerpt },
      },
      req: { ...req, locale: 'es' } as PayloadRequest,
    })

    ids.push(String(doc.id))
  }

  return ids
}

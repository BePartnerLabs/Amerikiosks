import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from './uploadMedia'

const insightPosts = [
  {
    slug: 'physical-retail-feel-intentional',
    title: 'What does it really take to make physical retail feel intentional?',
    heroAsset: 'image-post1.webp',
    heroAlt: 'Premium kiosk in a high-traffic retail environment',
    excerpt:
      'The machine is only the visible layer. Value comes from choosing the right venue, curating the brand moment, and operating the experience so it feels exactly right when people are ready to buy.',
  },
  {
    slug: 'location-matters-more-than-machine',
    title: 'Why does location matter more than the machine?',
    heroAsset: 'image-post2.webp',
    heroAlt: 'Branded kiosk placement at an airport transit hub',
    excerpt:
      'Because context shapes intent. Airports, resorts, and venues turn convenience into a branded moment when the offer fits the journey.',
  },
  {
    slug: 'automated-retail-feel-premium',
    title: 'Can automated retail feel premium?',
    heroAsset: 'image-post3.webp',
    heroAlt: 'Premium automated retail kiosk with brand wrap',
    excerpt:
      'Yes, when the offer, hardware, placement, and upkeep are curated to match the standard of the space around it.',
  },
  {
    slug: 'end-to-end-operation',
    title: 'What does end-to-end operation include?',
    heroAsset: 'image-post1.webp',
    heroAlt: 'Amerikiosks end-to-end retail operation',
    excerpt:
      'Fully branded kiosks, merchandising, replenishment, payments, telemetry, and support. Without asking venue staff to be the partner team.',
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
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })

    const data = {
      title: post.title,
      slug: post.slug,
      _status: 'published' as const,
      heroImage: heroImage.id,
      content: simpleRichText(post.excerpt),
      publishedAt: new Date().toISOString(),
      meta: { image: heroImage.id },
    }

    const doc =
      existing.docs.length > 0
        ? await payload.update({ collection: 'posts', id: existing.docs[0]!.id, data, req })
        : await payload.create({ collection: 'posts', data, req })

    ids.push(String(doc.id))
  }

  return ids
}

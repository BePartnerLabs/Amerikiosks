import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const machines = [
  {
    slug: 'full-size-branded-machine',
    name: 'Full-size branded machine',
    nameEs: 'Máquina de tamaño completo',
    tagline: 'Maximum canvas for brand expression at full height',
    taglineEs: 'Máximo espacio para la expresión de marca a altura completa',
    asset: 'machine-full-size.jpg',
    tag: 'full-size',
  },
  {
    slug: 'campaign-activation-unit',
    name: 'Campaign activation unit',
    nameEs: 'Unidad de activación de campaña',
    tagline: 'Launch-ready for limited drops and product launches',
    taglineEs: 'Lista para lanzamientos de campaña y drops de producto',
    asset: 'machine-campaign.jpg',
    tag: 'campaign',
  },
  {
    slug: 'compact-footprint-machine',
    name: 'Compact footprint machine',
    nameEs: 'Máquina de huella compacta',
    tagline: 'Fits tight spaces without sacrificing brand presence',
    taglineEs: 'Se adapta a espacios reducidos sin perder presencia de marca',
    asset: 'machine-compact.jpg',
    tag: 'compact',
  },
  {
    slug: 'premium-venue-configuration',
    name: 'Premium venue configuration',
    nameEs: 'Configuración para venues premium',
    tagline: 'Elevated finish for airports, hotels, and premium retail',
    taglineEs: 'Acabado elevado para aeropuertos, hoteles y retail premium',
    asset: 'machine-premium.jpg',
    tag: 'premium',
  },
]

const faqs = [
  {
    question: 'Do we control pricing?',
    answer:
      'Pricing can be defined with your team based on product strategy, venue context, and commercial goals. You set the price; Amerikiosks handles execution.',
    weight: 40,
    tags: ['brands'],
  },
  {
    question: 'Who handles replenishment?',
    answer:
      'Amerikiosks manages replenishment workflows, inventory monitoring, and operational coordination. Your team focuses on the brand; we handle the operations.',
    weight: 30,
    tags: ['brands', 'replenishment'],
  },
  {
    question: 'Can the machine be fully branded?',
    answer:
      'Yes. Wraps, screen content, product presentation, and campaign messaging can be tailored to your brand system — from color palette to campaign visual language.',
    weight: 20,
    tags: ['brands', 'branding'],
  },
  {
    question: 'Can we test locations before committing to a rollout?',
    answer:
      'Yes. Programs can test venues, assortments, pricing, and campaign messages before scaling. We use sales and inventory data to inform rollout decisions.',
    weight: 10,
    tags: ['brands'],
  },
]

const richText = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text }],
      },
    ],
  },
})

export const seedForBrands = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding For Brands page (machines, FAQs, page)...')

  // ── Machine images + records ───────────────────────────────────────────────
  const machineIds: number[] = []

  for (const m of machines) {
    const image = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'public', 'seed-assets', m.asset),
      m.name,
    )

    const existing = await payload.find({
      collection: 'machines',
      where: { slug: { equals: m.slug } },
      limit: 1,
      req,
    })

    let machineId: number

    if (existing.totalDocs > 0) {
      const updated = await payload.update({
        collection: 'machines',
        id: existing.docs[0]!.id,
        locale: 'en',
        data: { name: m.name, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }] },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      machineId = updated.id as number
      payload.logger.info(`  Updated machine: ${m.name}`)
    } else {
      const created = await payload.create({
        collection: 'machines',
        locale: 'en',
        data: {
          name: m.name,
          slug: m.slug,
          tagline: m.tagline,
          image: image.id,
          tags: [{ label: m.tag }],
          layout: [],
          _status: 'published',
        },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      machineId = created.id as number
      payload.logger.info(`  Created machine: ${m.name}`)
    }

    await payload.update({
      collection: 'machines',
      id: machineId,
      locale: 'es',
      data: { name: m.nameEs, tagline: m.taglineEs },
      req: { ...req, locale: 'es' } as PayloadRequest,
    })

    machineIds.push(machineId)
  }

  // ── FAQ items ──────────────────────────────────────────────────────────────
  for (const faq of faqs) {
    const existing = await payload.find({
      collection: 'faqItems',
      where: { question: { equals: faq.question } },
      limit: 1,
      req,
    })

    if (existing.totalDocs > 0) {
      payload.logger.info(`  FAQ exists: ${faq.question}`)
      continue
    }

    await payload.create({
      collection: 'faqItems',
      data: {
        question: faq.question,
        answer: {
          root: {
            type: 'root',
            version: 1,
            direction: null,
            format: '' as const,
            indent: 0,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', version: 1, text: faq.answer }],
              },
            ],
          },
        },
        weight: faq.weight,
        tags: faq.tags.map((label) => ({ label })),
      },
      req,
    })
    payload.logger.info(`  Created FAQ: ${faq.question}`)
  }

  // ── Hero image ─────────────────────────────────────────────────────────────
  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-brands.png'),
    'Branded kiosk in a retail venue for brand activations',
  )

  // ── For Brands page ────────────────────────────────────────────────────────
  await upsertPage(
    payload,
    req,
    {
      title: 'For Brands',
      slug: 'for-brands',
      hero: {
        type: 'mediumImpact',
        media: heroImage.id,
        richText: {
          root: {
            type: 'root',
            version: 1,
            direction: null,
            format: '' as const,
            indent: 0,
            children: [
              {
                type: 'heading',
                tag: 'h1',
                version: 1,
                children: [
                  { type: 'text', version: 1, text: 'For brands ready to show up with intent.' },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'Launch branded retail experiences in premium venues without building stores, hiring staff, or managing daily operations.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Start a Brand Program',
              type: 'custom',
              url: '/contact',
              appearance: 'default',
            },
          },
          {
            link: {
              label: 'See case studies',
              type: 'custom',
              url: '/insights',
              appearance: 'outline',
            },
          },
        ],
      },
      layout: [
        {
          blockType: 'insightsShowcase',
          blockName: 'Real Brand Moments',
          eyebrow: 'REAL BRAND MOMENTS',
          heading: 'Real brand moments, built to sell.',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Program Four Decisions',
          variant: 'pillar',
          eyebrow: 'FOR BRANDS',
          heading: 'One program. Four decisions your team controls.',
          subheading:
            'Amerikiosks gives brand teams control over where the experience appears, how it looks, how it operates, and what can be learned before scaling.',
          items: [
            {
              eyebrow: 'PLACEMENT',
              title: 'Place with intent',
              body: richText(
                'Show up in premium contexts where attention, need, and brand relevance already meet.',
              ),
            },
            {
              eyebrow: 'EXPRESSION',
              title: 'Control the experience',
              body: richText(
                'Wraps, screen content, assortment, pricing strategy, and campaign expression stay on-brand.',
              ),
            },
            {
              eyebrow: 'OPERATIONS',
              title: 'Launch without overhead',
              body: richText(
                'Installation, replenishment, venue coordination, service, and support move through one partner.',
              ),
            },
            {
              eyebrow: 'LEARNING',
              title: 'Learn before scaling',
              body: richText(
                'Use sales, inventory, location, and product-level signals to understand what deserves scale.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          blockName: 'Formats Grid',
          eyebrow: 'FORMATS',
          heading: 'Formats built around your brand moment.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          blockName: 'How It Works',
          eyebrow: 'HOW IT WORKS',
          heading: 'From first opportunity to daily operation.',
          subheading:
            'You get physical retail presence without building a retail operation. Amerikiosks plans, launches, operates, and optimizes the program with your team.',
          steps: [
            {
              title: 'Define the moment',
              body: richText(
                'We define your category, audience, venue fit, campaign goal, and the consumer your brand should own.',
              ),
            },
            {
              title: 'Match the context',
              body: richText(
                'We identify high-intent venues that fit your audience, product, and desired retail behavior.',
              ),
            },
            {
              title: 'Design the experience',
              body: richText(
                'Machine format, wrap, screen content, assortment, payment flow, and inventory plan come together.',
              ),
            },
            {
              title: 'Launch with one partner',
              body: richText(
                'Amerikiosks coordinates installation, venue setup, replenishment workflows, and go-live support.',
              ),
            },
            {
              title: 'Operate and optimize',
              body: richText(
                'We monitor sales, inventory, and location performance to refine assortment and campaign decisions.',
              ),
            },
          ],
          cta: [
            {
              link: {
                label: 'Start a Brand Program',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Start A Program',
          heading: 'Answers before your brand shows up.',
          subheading:
            'A focused form and practical FAQ help qualify the right program without turning the page into a generic contact flow.',
          filterTags: [{ tag: 'brands' }],
          form: { heading: 'Start a brand program' },
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Brands — Amerikiosks',
        description:
          'Launch branded retail experiences in premium venues without building stores, hiring staff, or managing daily operations.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Marcas',
      slug: 'for-brands',
      layout: [],
      meta: {
        title: 'Para Marcas — Amerikiosks',
        description:
          'Lanza experiencias de retail de marca en venues premium sin construir tiendas ni gestionar operaciones diarias.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Brands seeding complete.')
}

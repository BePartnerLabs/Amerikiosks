import config from '@payload-config'
import { getPayload } from 'payload'
import { brandProgramForm } from '@/endpoints/seed/brand-program-form'

async function seed() {
  const payload = await getPayload({ config })

  // ── Machines ─────────────────────────────────────────────────────────────
  const machineNames = [
    {
      name: 'Full-size branded machine',
      slug: 'full-size-branded-machine',
      tagline: 'Maximum canvas for brand expression at full height',
      tag: 'full-size',
    },
    {
      name: 'Campaign activation unit',
      slug: 'campaign-activation-unit',
      tagline: 'Launch-ready for limited drops and product launches',
      tag: 'campaign',
    },
    {
      name: 'Compact footprint machine',
      slug: 'compact-footprint-machine',
      tagline: 'Fits tight spaces without sacrificing brand presence',
      tag: 'compact',
    },
    {
      name: 'Premium venue configuration',
      slug: 'premium-venue-configuration',
      tagline: 'Elevated finish for airports, hotels, and premium retail',
      tag: 'premium',
    },
  ]

  const machineIds: Record<string, number> = {}

  for (const m of machineNames) {
    // Replace mediaId with a real media ID from your database.
    // Find IDs via Payload admin → Media, or: SELECT id FROM media LIMIT 10;
    const mediaId = 1 // ← REPLACE with actual media ID

    const existing = await payload.find({
      collection: 'machines',
      where: { slug: { equals: m.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      machineIds[m.slug] = existing.docs[0]?.id as number
      console.log(`Machine exists: ${m.name}`)
      continue
    }

    const machine = await payload.create({
      collection: 'machines',
      data: {
        name: m.name,
        slug: m.slug,
        tagline: m.tagline,
        image: mediaId,
        tags: [{ label: m.tag }],
        layout: [],
        _status: 'published',
      },
    })
    machineIds[m.slug] = machine.id as number
    console.log(`Created machine: ${m.name}`)
  }

  // ── FAQItems ─────────────────────────────────────────────────────────────
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

  for (const faq of faqs) {
    const existing = await payload.find({
      collection: 'faqItems',
      where: { question: { equals: faq.question } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`FAQ exists: ${faq.question}`)
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
    })
    console.log(`Created FAQ: ${faq.question}`)
  }

  // ── Brand Program Form ────────────────────────────────────────────────────
  let brandFormId: number
  const existingBrandForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: brandProgramForm.title } },
    limit: 1,
  })
  if (existingBrandForm.totalDocs > 0) {
    brandFormId = existingBrandForm.docs[0]?.id as number
  } else {
    const created = await payload.create({ collection: 'forms', data: brandProgramForm })
    brandFormId = created.id as number
    console.log('Created Brand Program Form')
  }

  // ── For Brands page ───────────────────────────────────────────────────────
  const slug = 'who-its-for/for-brands'
  const existingPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existingPage.totalDocs > 0) {
    console.log(`Page exists: ${slug}`)
    process.exit(0)
  }

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

  await payload.create({
    collection: 'pages',
    data: {
      title: 'For Brands',
      slug,
      hero: {
        type: 'mediumImpact',
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
                  {
                    type: 'text',
                    version: 1,
                    text: 'For brands ready to show up with intent.',
                  },
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
        media: 1, // ← REPLACE with hero image media ID
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
          filterTags: [
            { tag: 'full-size' },
            { tag: 'campaign' },
            { tag: 'compact' },
            { tag: 'premium' },
          ],
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
          form: brandFormId,
        },
      ],
      _status: 'published',
    },
  })
  console.log(`Created page: ${slug}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

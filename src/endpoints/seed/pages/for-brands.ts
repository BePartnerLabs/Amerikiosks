import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const projects = [
  {
    slug: 'fan-stand',
    title: 'Fan Stand',
    titleEs: 'Fan Stand',
    category: 'FAN STAND',
    categoryEs: 'ESTADIO',
    description:
      'A branded vending experience placed where fans are already browsing, waiting, and ready to buy.',
    descriptionEs:
      'Una experiencia de venta de marca colocada donde los fanáticos ya están navegando, esperando y listos para comprar.',
    asset: 'project-fan-stand.jpg',
    tag: 'brand',
  },
  {
    slug: 'airport-retail',
    title: 'Airport Retail',
    titleEs: 'Retail en Aeropuerto',
    category: 'AIRPORT RETAIL',
    categoryEs: 'RETAIL AEROPUERTO',
    description:
      'A premium automated format for reaching high-intent audiences in dwell-time environments.',
    descriptionEs:
      'Un formato automatizado premium para llegar a audiencias de alta intención en entornos de espera.',
    asset: 'project-airport-retail.png',
    tag: 'brand',
  },
]

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

  // seedWhoItsFor always runs before this fn — guaranteed to exist; fall back gracefully for standalone runs
  const whoItsForResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'who-its-for' } },
    limit: 1,
    depth: 0,
    req,
  })
  const whoItsForId = whoItsForResult.totalDocs > 0 ? whoItsForResult.docs[0]?.id : undefined

  // Delete any existing for-brands page so upsertPage creates fresh (avoids
  // validation errors when the stub was previously created with a different hero type)
  const existingPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'for-brands' } },
    limit: 1,
    req,
  })
  if (existingPage.totalDocs > 0) {
    await payload.delete({
      collection: 'pages',
      id: existingPage.docs[0]?.id as number,
      overrideAccess: true,
      req,
    })
    payload.logger.info('  Deleted existing for-brands page stub')
  }

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
        id: existing.docs[0]?.id as number,
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

  // ── Projects ───────────────────────────────────────────────────────────────
  for (const p of projects) {
    const image = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'public', 'seed-assets', p.asset),
      p.title,
    )

    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: p.slug } },
      limit: 1,
      req,
    })

    let projectId: number

    if (existing.totalDocs > 0) {
      projectId = existing.docs[0]?.id as number
      await payload.update({
        collection: 'projects',
        id: projectId,
        locale: 'en',
        data: {
          title: p.title,
          category: p.category,
          description: p.description,
          image: image.id,
          tags: [{ label: p.tag }],
          _status: 'published' as const,
        },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      payload.logger.info(`  Updated project: ${p.title}`)
    } else {
      const created = await payload.create({
        collection: 'projects',
        locale: 'en',
        data: {
          title: p.title,
          slug: p.slug,
          category: p.category,
          description: p.description,
          image: image.id,
          tags: [{ label: p.tag }],
          _status: 'published' as const,
        },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      projectId = created.id as number
      payload.logger.info(`  Created project: ${p.title}`)
    }

    await payload.update({
      collection: 'projects',
      id: projectId,
      locale: 'es',
      data: { title: p.titleEs, category: p.categoryEs, description: p.descriptionEs },
      req: { ...req, locale: 'es' } as PayloadRequest,
    })
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
      ...(whoItsForId !== undefined ? { parent: whoItsForId } : {}),
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
        tags: [
          { label: 'Brand-controlled' },
          { label: 'Fully managed' },
          { label: 'Built to learn' },
        ],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Brand Moments',
          eyebrow: 'REAL BRAND MOMENTS',
          heading: 'Real brand moments, built to sell.',
          body: richText(
            'See how placement, product mix, and operations turn high-traffic spaces into memorable retail moments.',
          ),
          filterTag: 'brand',
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
                  {
                    type: 'text',
                    version: 1,
                    text: 'Para marcas listas para aparecer con intención.',
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
                    text: 'Lanza experiencias de retail de marca en venues premium sin construir tiendas ni gestionar operaciones diarias.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Iniciar un programa de marca',
              type: 'custom',
              url: '/contact',
              appearance: 'default',
            },
          },
          {
            link: {
              label: 'Ver casos de éxito',
              type: 'custom',
              url: '/insights',
              appearance: 'outline',
            },
          },
        ],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Brand Moments',
          eyebrow: 'MOMENTOS REALES DE MARCA',
          heading: 'Momentos reales de marca, construidos para vender.',
          body: richText(
            'Mira cómo la ubicación, la combinación de productos y las operaciones convierten espacios de alto tráfico en momentos de venta memorables.',
          ),
          filterTag: 'brand',
        },
        {
          blockType: 'cardGrid',
          variant: 'pillar' as const,
          eyebrow: 'PARA MARCAS',
          heading: 'Un programa. Cuatro decisiones que controla tu equipo.',
          subheading:
            'Amerikiosks le da a los equipos de marca control sobre dónde aparece la experiencia, cómo se ve, cómo opera y qué se puede aprender antes de escalar.',
          items: [
            {
              eyebrow: 'UBICACIÓN',
              title: 'Ubícate con intención',
              body: richText(
                'Aparece en contextos premium donde la atención, la necesidad y la relevancia de marca ya se encuentran.',
              ),
            },
            {
              eyebrow: 'EXPRESIÓN',
              title: 'Controla la experiencia',
              body: richText(
                'Wraps, contenido en pantalla, surtido, estrategia de precios y expresión de campaña se mantienen on-brand.',
              ),
            },
            {
              eyebrow: 'OPERACIONES',
              title: 'Lanza sin sobrecarga',
              body: richText(
                'Instalación, reabastecimiento, coordinación con el venue, servicio y soporte pasan por un solo partner.',
              ),
            },
            {
              eyebrow: 'APRENDIZAJE',
              title: 'Aprende antes de escalar',
              body: richText(
                'Usa señales de ventas, inventario, ubicación y producto para entender qué merece escala.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          eyebrow: 'FORMATOS',
          heading: 'Formatos construidos para tu momento de marca.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          eyebrow: 'CÓMO FUNCIONA',
          heading: 'De la primera oportunidad a la operación diaria.',
          subheading:
            'Obtienes presencia de retail físico sin construir una operación retail. Amerikiosks planifica, lanza, opera y optimiza el programa con tu equipo.',
          steps: [
            {
              title: 'Define el momento',
              body: richText(
                'Definimos tu categoría, audiencia, ajuste al venue, objetivo de campaña y el consumidor que tu marca debe conquistar.',
              ),
            },
            {
              title: 'Encuentra el contexto',
              body: richText(
                'Identificamos venues de alta intención que se ajusten a tu audiencia, producto y comportamiento retail deseado.',
              ),
            },
            {
              title: 'Diseña la experiencia',
              body: richText(
                'El formato de máquina, wrap, contenido en pantalla, surtido, flujo de pago y plan de inventario se integran.',
              ),
            },
            {
              title: 'Lanza con un solo partner',
              body: richText(
                'Amerikiosks coordina la instalación, configuración del venue, flujos de reabastecimiento y soporte en el lanzamiento.',
              ),
            },
            {
              title: 'Opera y optimiza',
              body: richText(
                'Monitoreamos ventas, inventario y rendimiento por ubicación para refinar decisiones de surtido y campaña.',
              ),
            },
          ],
          cta: [
            {
              link: {
                label: 'Iniciar un programa de marca',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          heading: 'Respuestas antes de que tu marca aparezca.',
          subheading:
            'Un formulario enfocado y un FAQ práctico ayudan a calificar el programa correcto sin convertir la página en un flujo de contacto genérico.',
          filterTags: [{ tag: 'brands' }],
          form: { heading: 'Iniciar un programa de marca' },
        },
      ],
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

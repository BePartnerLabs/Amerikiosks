import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { emergingBrandForm } from '../emerging-brand-form'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const projects = [
  {
    slug: 'emerging-first-launch',
    title: 'From zero physical presence to a premium venue.',
    titleEs: 'De cero presencia física a un venue premium.',
    category: 'FIRST LAUNCH',
    categoryEs: 'PRIMER LANZAMIENTO',
    description:
      'An emerging brand tests its product in the real world, in a high-traffic space, without opening a store.',
    descriptionEs:
      'Una marca emergente prueba su producto en el mundo real, en un espacio de alto tráfico, sin abrir tienda.',
    asset: 'project-fan-stand.jpg',
    tag: 'emerging',
  },
  {
    slug: 'emerging-multi-location',
    title: 'Real data before committing budget.',
    titleEs: 'Datos reales antes de comprometer presupuesto.',
    category: 'MULTI-LOCATION VALIDATION',
    categoryEs: 'VALIDACIÓN MULTI-UBICACIÓN',
    description:
      'Real sales and inventory results per location, used to decide where to scale first.',
    descriptionEs:
      'Resultados de ventas e inventario por ubicación, usados para decidir dónde escalar primero.',
    asset: 'project-airport-retail.png',
    tag: 'emerging',
  },
]

const machines = [
  {
    slug: 'emerging-single-pilot',
    name: 'Single Location Pilot',
    nameEs: 'Piloto de Una Ubicación',
    tagline: 'Validate your product in one premium venue before committing',
    taglineEs: 'Valida tu producto en un solo venue premium antes de comprometerte',
    asset: 'machine-compact.jpg',
    tag: 'emerging-pilot',
  },
  {
    slug: 'emerging-founder-program',
    name: 'Founder Program',
    nameEs: 'Programa Founder',
    tagline: 'Preferred access to selected venues for early-stage brands',
    taglineEs: 'Acceso preferencial a venues seleccionados para marcas en etapa temprana',
    asset: 'machine-full-size.jpg',
    tag: 'emerging-founder',
  },
  {
    slug: 'emerging-multi-venue',
    name: 'Multi-Venue Expansion',
    nameEs: 'Expansión Multi-Venue',
    tagline: 'Scale to multiple locations using pilot data',
    taglineEs: 'Escala a varias ubicaciones usando datos del piloto',
    asset: 'machine-campaign.jpg',
    tag: 'emerging-multi',
  },
  {
    slug: 'emerging-consignment',
    name: 'Consignment Model',
    nameEs: 'Modelo Consignación',
    tagline: 'Minimum operational investment — you pay as you sell',
    taglineEs: 'Mínima inversión operativa — pagas conforme vendes',
    asset: 'machine-premium.jpg',
    tag: 'emerging-consignment',
  },
]

const faqs = [
  {
    question: 'What is the minimum investment to get started?',
    questionEs: '¿Cuál es la inversión mínima para empezar?',
    answer:
      'It depends on the model chosen. Under consignment, your initial investment is only the inventory — Amerikiosks does not charge for installation or operations until there are sales.',
    answerEs:
      'Depende del modelo elegido. Bajo consignación, tu inversión inicial es solo el inventario — Amerikiosks no cobra por instalación ni operación hasta que haya ventas.',
    weight: 40,
    tags: ['emerging-brands'],
  },
  {
    question: 'Can we start with a single location?',
    questionEs: '¿Podemos empezar con una sola ubicación?',
    answer:
      'Yes. The single-location pilot is designed exactly for that: validate before committing more resources.',
    answerEs:
      'Sí. El piloto de una ubicación está diseñado exactamente para eso: validar antes de comprometer más recursos.',
    weight: 30,
    tags: ['emerging-brands'],
  },
  {
    question: "What happens if the product doesn't perform well at that location?",
    questionEs: '¿Qué pasa si el producto no funciona bien en esa ubicación?',
    answer:
      'We use the pilot data to adjust — whether changing the product, location, or model, before thinking about scaling.',
    answerEs:
      'Usamos los datos del piloto para ajustar — ya sea cambiar producto, ubicación o modelo, antes de pensar en escalar.',
    weight: 20,
    tags: ['emerging-brands'],
  },
  {
    question: 'How do we apply to the founder program?',
    questionEs: '¿Cómo aplicamos al programa founder?',
    answer:
      'Through the contact form, telling us about your brand, current product, and physical distribution objectives.',
    answerEs:
      'A través del formulario de contacto, contándonos sobre tu marca, producto actual y objetivos de distribución física.',
    weight: 10,
    tags: ['emerging-brands'],
  },
]

const richText = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text }] }],
  },
})

export const seedForEmergingBrands = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<void> => {
  payload.logger.info('— Seeding For Emerging Brands page...')

  const whoItsForResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'who-its-for' } },
    limit: 1,
    depth: 0,
    req,
  })
  const whoItsForId = whoItsForResult.totalDocs > 0 ? whoItsForResult.docs[0]?.id : undefined

  const existingPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'for-emerging-brands' } },
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
  }

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
  }

  for (const faq of faqs) {
    const existing = await payload.find({
      collection: 'faqItems',
      where: { question: { equals: faq.question } },
      locale: 'en',
      limit: 100,
      req,
    })
    if (existing.totalDocs > 1) {
      for (const dup of existing.docs.slice(1))
        await payload.delete({ collection: 'faqItems', id: dup.id as number, req })
      existing.docs = existing.docs.slice(0, 1)
      existing.totalDocs = 1
    }
    let faqId: number
    if (existing.totalDocs > 0) {
      faqId = existing.docs[0]?.id as number
      await payload.update({
        collection: 'faqItems',
        id: faqId,
        locale: 'en',
        data: {
          question: faq.question,
          answer: richText(faq.answer),
          weight: faq.weight,
          tags: faq.tags.map((label) => ({ label })),
        },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      payload.logger.info(`  Updated FAQ: ${faq.question}`)
    } else {
      const created = await payload.create({
        collection: 'faqItems',
        locale: 'en',
        data: {
          question: faq.question,
          answer: richText(faq.answer),
          weight: faq.weight,
          tags: faq.tags.map((label) => ({ label })),
        },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      faqId = created.id as number
      payload.logger.info(`  Created FAQ: ${faq.question}`)
    }
    await payload.update({
      collection: 'faqItems',
      id: faqId,
      locale: 'es',
      data: { question: faq.questionEs, answer: richText(faq.answerEs) },
      req: { ...req, locale: 'es' } as PayloadRequest,
    })
  }

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

  let emergingFormId: number
  const existingForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: emergingBrandForm.title } },
    limit: 1,
    req,
  })
  if (existingForm.totalDocs > 0) {
    emergingFormId = existingForm.docs[0]?.id as number
    payload.logger.info('  Emerging Brand Form exists, skipping creation')
  } else {
    const created = await payload.create({ collection: 'forms', data: emergingBrandForm, req })
    emergingFormId = created.id as number
    payload.logger.info('  Created Emerging Brand Form')
  }

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-brands.png'),
    'Emerging brand kiosk in a premium venue',
  )

  await upsertPage(
    payload,
    req,
    {
      title: 'For Emerging Brands',
      slug: 'for-emerging-brands',
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
                  {
                    type: 'text',
                    version: 1,
                    text: 'For emerging brands ready to test the real world.',
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
                    text: 'Reach airports, hotels, and premium venues from day one — without the cost of a commercial store, and with the infrastructure that used to be reserved for big brands.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Apply to the founder program',
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
          { label: 'Low entry cost' },
          { label: 'Real validation' },
          { label: 'Progressive scale' },
        ],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Launch Moments',
          eyebrow: 'REAL LAUNCH MOMENTS',
          heading: 'Real launch moments, built to validate.',
          body: richText(
            'See how emerging brands test physical retail presence in premium venues before committing to a full rollout.',
          ),
          filterTag: 'emerging',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Pilot Four Decisions',
          variant: 'pillar',
          eyebrow: 'FOR EMERGING BRANDS',
          heading: 'One pilot. Four decisions before scaling.',
          subheading:
            'Amerikiosks gives you access to premium physical distribution with the lowest possible commitment — you decide what to scale with real data.',
          items: [
            {
              eyebrow: 'ENTRY',
              title: 'Low entry cost',
              body: richText(
                'Access premium venues without the investment required to open a commercial store.',
              ),
            },
            {
              eyebrow: 'MODEL',
              title: 'Model flexibility',
              body: richText(
                'Choose consignment, full-service, or services model according to your stage and available capital.',
              ),
            },
            {
              eyebrow: 'OPERATIONS',
              title: 'Zero own infrastructure',
              body: richText(
                'Amerikiosks operates installation, inventory, and maintenance — you focus on the product.',
              ),
            },
            {
              eyebrow: 'DATA',
              title: 'Decide with real data',
              body: richText('Use sales results per location to decide where and how to scale.'),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          blockName: 'Launch Routes',
          eyebrow: 'LAUNCH ROUTES',
          heading: 'Launch routes according to your stage.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          blockName: 'How It Works',
          eyebrow: 'HOW IT WORKS',
          heading: 'From founder to validated presence.',
          subheading:
            'Without opening a store, without unnecessarily frozen inventory — Amerikiosks gives you the physical channel and the data to decide the next step.',
          steps: [
            {
              title: 'Apply to the program',
              body: richText(
                'Tell us about your brand, product, and physical distribution objectives.',
              ),
            },
            {
              title: 'Choose the model',
              body: richText(
                'We select together the model (consignment, full-service, or services) according to your stage.',
              ),
            },
            {
              title: 'Launch your pilot',
              body: richText(
                'Your product enters a selected premium venue, with installation and operations handled by Amerikiosks.',
              ),
            },
            {
              title: 'Receive real data',
              body: richText(
                'Sales, inventory, and purchase behavior per location, without needing your own team.',
              ),
            },
            {
              title: 'Decide how to scale',
              body: richText('Use the pilot results to decide new locations or adjust the model.'),
            },
          ],
          cta: [
            {
              link: {
                label: 'Apply to the founder program',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Apply To Founder Program',
          eyebrow: 'APPLY TO THE PROGRAM',
          heading: 'Answers before your brand launches.',
          subheading:
            'A focused form and practical FAQ to qualify the right model for your brand stage.',
          filterTags: [{ tag: 'emerging-brands' }],
          form: emergingFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Emerging Brands — Amerikiosks',
        description:
          'Test real-world retail in premium venues from day one — low entry cost, real data, and infrastructure to scale.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Marcas Emergentes',
      slug: 'for-emerging-brands',
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
                    text: 'Para marcas emergentes listas para probar el mundo real.',
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
                    text: 'Llega a aeropuertos, hoteles y venues premium desde el primer día — sin el costo de un local comercial, y con la infraestructura que antes solo tenían las marcas grandes.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Aplicar al programa founder',
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
      meta: {
        title: 'Para Marcas Emergentes — Amerikiosks',
        description:
          'Prueba tu presencia retail en el mundo real desde el primer día — bajo costo de entrada, datos reales e infraestructura para escalar.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Emerging Brands seeding complete.')
}

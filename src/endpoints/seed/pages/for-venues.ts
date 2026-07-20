import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { findOrCreateForm, translateFormEs } from '../translateForm'
import { uploadMedia } from '../uploadMedia'
import {
  venueProgramForm,
  venueProgramFormConfirmationMessageEs,
  venueProgramFormFieldDefs,
  venueProgramFormSubmitButtonLabelEs,
} from '../venue-program-form'
import { upsertPage } from './utils'

const projects = [
  {
    slug: 'venue-hotel-lobby',
    title: 'Passive income in the lobby, without lifting a finger.',
    titleEs: 'Ingresos pasivos en el lobby, sin levantar un dedo.',
    category: 'HOTEL / HOSPITALITY',
    categoryEs: 'HOTEL / HOSPITALIDAD',
    description:
      'A premium retail experience that improves venue perception and generates monthly revenue without operational load on your team.',
    descriptionEs:
      'Una experiencia de retail premium que mejora la percepción del venue y genera revenue mensual sin carga operativa para tu equipo.',
    asset: 'project-fan-stand.jpg',
    tag: 'venue',
  },
  {
    slug: 'venue-airport-transit',
    title: 'Waiting space turned into a point of sale.',
    titleEs: 'Espacio de espera convertido en punto de venta.',
    category: 'AIRPORT / TRANSIT',
    categoryEs: 'AEROPUERTO / TRÁNSITO',
    description:
      'End-to-end operated kiosks in high-traffic zones, where the traveler is already ready to buy.',
    descriptionEs:
      'Kiosks operados de extremo a extremo en zonas de alto tráfico, donde el viajero ya está listo para comprar.',
    asset: 'project-airport-retail.png',
    tag: 'venue',
  },
]

const machines = [
  {
    slug: 'venue-lobby-reception',
    name: 'Lobby & Reception',
    nameEs: 'Lobby & Recepción',
    tagline: 'Premium presence at the first point of contact with your visitors',
    taglineEs: 'Presencia premium en el primer punto de contacto con tus visitantes',
    asset: 'machine-premium.jpg',
    tag: 'venue-lobby',
  },
  {
    slug: 'venue-waiting-areas',
    name: 'Waiting Areas',
    nameEs: 'Zonas de Espera',
    tagline: 'Convert idle time into selling moments',
    taglineEs: 'Convierte tiempos muertos en momentos de venta',
    asset: 'machine-full-size.jpg',
    tag: 'venue-waiting',
  },
  {
    slug: 'venue-common-areas',
    name: 'Common Areas / Corridors',
    nameEs: 'Áreas Comunes / Pasillos',
    tagline: 'Maximum visibility without interfering with space flow',
    taglineEs: 'Máxima visibilidad sin interferir con el flujo del espacio',
    asset: 'machine-compact.jpg',
    tag: 'venue-common',
  },
  {
    slug: 'venue-multi-unit',
    name: 'Multi-Unit Configuration',
    nameEs: 'Configuración Multi-Unidad',
    tagline: 'For large venues with multiple high-traffic points',
    taglineEs: 'Para venues grandes con múltiples puntos de alto tráfico',
    asset: 'machine-campaign.jpg',
    tag: 'venue-multi',
  },
]

const faqs = [
  {
    question: 'What initial investment do we need to make?',
    questionEs: '¿Qué inversión inicial necesitamos hacer?',
    answer:
      'None. Installation, initial inventory, and equipment run on Amerikiosks under the full-service model. You only provide the space.',
    answerEs:
      'Ninguna. La instalación, el inventario inicial y el equipo corren por cuenta de Amerikiosks bajo el modelo full-service. Solo aportas el espacio.',
    weight: 40,
    tags: ['venues'],
  },
  {
    question: 'Who operates and maintains the machine?',
    questionEs: '¿Quién opera y mantiene la máquina?',
    answer:
      'Amerikiosks. Replenishment, maintenance, technical support, and monitoring are our responsibility — your team does not need to intervene.',
    answerEs:
      'Amerikiosks. Reabastecimiento, mantenimiento, soporte técnico y monitoreo son responsabilidad nuestra — tu equipo no necesita intervenir.',
    weight: 30,
    tags: ['venues'],
  },
  {
    question: 'How and when do we receive revenue?',
    questionEs: '¿Cómo y cuándo recibimos los ingresos?',
    answer:
      'You receive your monthly commission according to the agreed model, along with a sales and performance report per location.',
    answerEs:
      'Recibes tu comisión mensual según el modelo acordado, junto con un reporte de ventas y performance por ubicación.',
    weight: 20,
    tags: ['venues'],
  },
  {
    question: 'What happens if the machine fails or needs maintenance?',
    questionEs: '¿Qué pasa si la máquina falla o necesita mantenimiento?',
    answer:
      'Our support team monitors remotely and coordinates maintenance without your staff having to manage it.',
    answerEs:
      'Nuestro equipo de soporte monitorea remotamente y coordina mantenimiento sin que tu personal tenga que gestionarlo.',
    weight: 10,
    tags: ['venues'],
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

export const seedForVenues = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding For Venues page...')

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
    where: { slug: { equals: 'for-venues' } },
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
      for (const dup of existing.docs.slice(1)) {
        await payload.delete({ collection: 'faqItems', id: dup.id as number, req })
      }
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

  const { id: venueFormId, fields: venueFormFields } = await findOrCreateForm(
    payload,
    req,
    venueProgramForm,
  )
  await translateFormEs(
    payload,
    req,
    venueFormId,
    venueFormFields,
    venueProgramFormFieldDefs,
    venueProgramFormSubmitButtonLabelEs,
    venueProgramFormConfirmationMessageEs,
  )

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-venues.jpg'),
    'Amerikiosks kiosk in a premium venue lobby',
  )

  await upsertPage(
    payload,
    req,
    {
      title: 'For Venues',
      slug: 'for-venues',
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
                    text: 'For venues ready to monetize without the effort.',
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
                    text: 'Turn underutilized space into monthly passive income — turnkey installation, no staff, no civil works, no management on your part.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Start a venue program',
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
          { label: 'No upfront investment' },
          { label: 'External operation' },
          { label: 'Monthly revenue' },
        ],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Venue Moments',
          eyebrow: 'REAL VENUE MOMENTS',
          heading: 'Real venue moments, built to earn.',
          body: richText(
            'See how placement and end-to-end operations turn high-traffic spaces into passive monthly revenue.',
          ),
          filterTag: 'venue',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Program Zero Load',
          variant: 'pillar',
          eyebrow: 'FOR VENUES',
          heading: 'One program. Zero operational load for your team.',
          subheading:
            'Amerikiosks installs, operates, and maintains the experience — your team only receives the revenue report.',
          items: [
            {
              eyebrow: 'SPACE',
              title: 'Leverage your space',
              body: richText(
                'Convert unused square meters into an asset that generates recurring monthly income.',
              ),
            },
            {
              eyebrow: 'INSTALLATION',
              title: 'Zero civil works',
              body: richText(
                'Turnkey installation: no construction, no additional permits, no interruptions to your daily operation.',
              ),
            },
            {
              eyebrow: 'OPERATIONS',
              title: 'Zero load for your staff',
              body: richText(
                'Replenishment, maintenance, support, and monitoring run on Amerikiosks — your team operates nothing.',
              ),
            },
            {
              eyebrow: 'REVENUE',
              title: 'Transparent monthly revenue',
              body: richText(
                'You receive your monthly commission with clear sales and performance reporting per location.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          blockName: 'Programs for Your Space',
          eyebrow: 'PROGRAMS',
          heading: 'Programs built for your type of space.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          blockName: 'How It Works',
          eyebrow: 'HOW IT WORKS',
          heading: 'From first conversation to first revenue report.',
          subheading:
            "You don't need to operate anything. Amerikiosks evaluates, installs, operates, and reports — your team only approves the location.",
          steps: [
            {
              title: 'Evaluate the space',
              body: richText(
                'We analyze traffic, layout, and opportunities within your venue to identify the best locations.',
              ),
            },
            {
              title: 'Define the model',
              body: richText(
                'We agree on the partnership model (full-service, consignment, or services) according to your operational preference.',
              ),
            },
            {
              title: 'Install without friction',
              body: richText(
                'We coordinate turnkey installation with no civil works or interruptions to your operation.',
              ),
            },
            {
              title: 'Operate end-to-end',
              body: richText('Replenishment, maintenance, and support run on our account.'),
            },
            {
              title: 'Receive your revenue',
              body: richText('Monthly clear reporting of sales, performance, and your commission.'),
            },
          ],
          cta: [
            {
              link: {
                label: 'Start a venue program',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Start A Venue Program',
          eyebrow: 'START A PROGRAM',
          heading: 'Answers before your venue earns.',
          subheading:
            'A focused form and practical FAQ help qualify the right partnership without turning the page into a generic contact flow.',
          filterTags: [{ tag: 'venues' }],
          form: venueFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Venues — Amerikiosks',
        description:
          'Turn underutilized venue space into monthly passive income with a fully managed kiosk program. No staff. No investment.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Venues',
      slug: 'para-venues',
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
                    text: 'Para venues listos para monetizar sin esfuerzo.',
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
                    text: 'Convierte espacio subutilizado en ingresos pasivos mensuales — instalación turnkey, sin staff, sin obra civil, sin gestión de tu parte.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Iniciar un programa de venue',
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
          eyebrow: 'MOMENTOS REALES DE VENUE',
          heading: 'Momentos reales de venue, construidos para generar.',
          body: richText(
            'Descubre cómo la ubicación estratégica y la operación integral convierten espacios de alto tráfico en ingresos pasivos mensuales.',
          ),
          filterTag: 'venue',
        },
        {
          blockType: 'cardGrid',
          variant: 'pillar',
          eyebrow: 'PARA VENUES',
          heading: 'Un programa. Cero carga operativa para tu equipo.',
          subheading:
            'Amerikiosks instala, opera y mantiene la experiencia — tu equipo solo recibe el reporte de ingresos.',
          items: [
            {
              eyebrow: 'ESPACIO',
              title: 'Aprovecha tu espacio',
              body: richText(
                'Convierte metros cuadrados sin uso en un activo que genera ingresos recurrentes mensuales.',
              ),
            },
            {
              eyebrow: 'INSTALACIÓN',
              title: 'Cero obra civil',
              body: richText(
                'Instalación turnkey: sin construcción, sin permisos adicionales, sin interrupciones a tu operación diaria.',
              ),
            },
            {
              eyebrow: 'OPERACIONES',
              title: 'Cero carga para tu personal',
              body: richText(
                'Reabastecimiento, mantenimiento, soporte y monitoreo corren por Amerikiosks — tu equipo no opera nada.',
              ),
            },
            {
              eyebrow: 'INGRESOS',
              title: 'Ingresos mensuales transparentes',
              body: richText(
                'Recibes tu comisión mensual con reportes claros de ventas y performance por ubicación.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          eyebrow: 'PROGRAMAS',
          heading: 'Programas diseñados para tu tipo de espacio.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          eyebrow: 'CÓMO FUNCIONA',
          heading: 'De la primera conversación al primer reporte de ingresos.',
          subheading:
            'No necesitas operar nada. Amerikiosks evalúa, instala, opera y reporta — tu equipo solo aprueba la ubicación.',
          steps: [
            {
              title: 'Evaluar el espacio',
              body: richText(
                'Analizamos tráfico, distribución y oportunidades dentro de tu venue para identificar las mejores ubicaciones.',
              ),
            },
            {
              title: 'Definir el modelo',
              body: richText(
                'Acordamos el modelo de partnership (full-service, consignación o servicios) según tu preferencia operativa.',
              ),
            },
            {
              title: 'Instalar sin fricción',
              body: richText(
                'Coordinamos instalación turnkey sin obra civil ni interrupciones a tu operación.',
              ),
            },
            {
              title: 'Operar de extremo a extremo',
              body: richText(
                'Reabastecimiento, mantenimiento y soporte corren por nuestra cuenta.',
              ),
            },
            {
              title: 'Recibir tus ingresos',
              body: richText('Reporte mensual claro de ventas, performance y tu comisión.'),
            },
          ],
          cta: [
            {
              link: {
                label: 'Iniciar un programa de venue',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          eyebrow: 'INICIAR UN PROGRAMA',
          heading: 'Respuestas antes de que tu venue genere.',
          subheading:
            'Un formulario enfocado y un FAQ práctico ayudan a calificar el partnership correcto sin convertir la página en un flujo de contacto genérico.',
          filterTags: [{ tag: 'venues' }],
          form: venueFormId,
        },
      ],
      meta: {
        title: 'Para Venues — Amerikiosks',
        description:
          'Convierte espacio subutilizado en ingresos pasivos mensuales con un programa de kiosks completamente gestionado.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Venues seeding complete.')
}

import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { agencyActivationForm } from '../agency-activation-form'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const projects = [
  {
    slug: 'agency-campaign-activation',
    title: 'A campaign people can touch, not just see.',
    titleEs: 'Una campaña que la gente puede tocar, no solo ver.',
    category: 'CAMPAIGN ACTIVATION',
    categoryEs: 'ACTIVACIÓN DE CAMPAÑA',
    description:
      'Branded kiosks as the physical extension of a media campaign, in the places where your audience already is.',
    descriptionEs:
      'Kiosks branded como extensión física de una campaña de medios, en los lugares donde tu audiencia ya está.',
    asset: 'project-fan-stand.jpg',
    tag: 'agency',
  },
  {
    slug: 'agency-product-drop',
    title: 'Launches with immediate physical presence.',
    titleEs: 'Lanzamientos con presencia física inmediata.',
    category: 'PRODUCT DROP / EVENT',
    categoryEs: 'DROP DE PRODUCTO / EVENTO',
    description:
      'Temporary activations in high-traffic venues, ready to coincide with your campaign timing.',
    descriptionEs:
      'Activaciones temporales en venues de alto tráfico, listas para coincidir con el timing de tu campaña.',
    asset: 'project-airport-retail.png',
    tag: 'agency',
  },
]

const machines = [
  {
    slug: 'agency-campaign-unit',
    name: 'Campaign Activation Unit',
    nameEs: 'Unidad de Activación de Campaña',
    tagline: 'Ready for launches and drops, with 100% customizable wrap',
    taglineEs: 'Lista para lanzamientos y drops, con wrap 100% personalizable',
    asset: 'machine-campaign.jpg',
    tag: 'agency-campaign',
  },
  {
    slug: 'agency-popup',
    name: 'Temporary Pop-up',
    nameEs: 'Pop-up Temporal',
    tagline: 'Fast deployment for events and short-duration campaigns',
    taglineEs: 'Despliegue rápido para eventos y campañas de corta duración',
    asset: 'machine-compact.jpg',
    tag: 'agency-popup',
  },
  {
    slug: 'agency-multi-venue',
    name: 'Multi-Venue Configuration',
    nameEs: 'Configuración Multi-Venue',
    tagline: 'Activate the same campaign in multiple spaces simultaneously',
    taglineEs: 'Activa la misma campaña en varios espacios simultáneamente',
    asset: 'machine-full-size.jpg',
    tag: 'agency-multi-venue',
  },
  {
    slug: 'agency-digital-screens',
    name: 'Digital Screen Integration',
    nameEs: 'Integración con Pantallas Digitales',
    tagline: 'Campaign content on active screens for greater impact',
    taglineEs: 'Contenido de campaña en pantallas activas para mayor impacto',
    asset: 'machine-premium.jpg',
    tag: 'agency-screens',
  },
]

const faqs = [
  {
    question: 'Can we define the full creative direction?',
    questionEs: '¿Podemos definir la dirección creativa completa?',
    answer:
      'Yes. Wraps, screens, assortment, and campaign messaging are produced according to the campaign brief you deliver — your team maintains full creative control.',
    answerEs:
      'Sí. Wraps, pantallas, surtido y mensajes se producen según el brief de campaña que entregues — tu equipo mantiene control creativo total.',
    weight: 40,
    tags: ['agencies'],
  },
  {
    question: 'How long does it take to set up an activation?',
    questionEs: '¿Cuánto tiempo toma montar una activación?',
    answer:
      'It depends on the format and venue availability, but pop-up formats are designed for fast deployment. We coordinate timing according to your campaign calendar.',
    answerEs:
      'Depende del formato y la disponibilidad del venue, pero los formatos pop-up están diseñados para despliegue rápido. Coordinamos timing según tu calendario de campaña.',
    weight: 30,
    tags: ['agencies'],
  },
  {
    question: 'Can multiple venues be activated at the same time?',
    questionEs: '¿Pueden activarse varios venues al mismo tiempo?',
    answer:
      'Yes. Multi-venue configurations allow replicating the same activation in different spaces simultaneously.',
    answerEs:
      'Sí. Las configuraciones multi-venue permiten replicar la misma activación en distintos espacios de forma simultánea.',
    weight: 20,
    tags: ['agencies'],
  },
  {
    question: 'What performance data do you provide for the client report?',
    questionEs: '¿Qué datos de desempeño entregan para el reporte al cliente?',
    answer:
      'We share interaction metrics, sales (if applicable), and performance per location, according to the type of activation.',
    answerEs:
      'Compartimos métricas de interacción, ventas (si aplica) y desempeño por ubicación, según el tipo de activación.',
    weight: 10,
    tags: ['agencies'],
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

export const seedForAgencies = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding For Agencies page...')

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
    where: { slug: { equals: 'for-agencies' } },
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

  let agencyFormId: number
  const existingForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: agencyActivationForm.title } },
    limit: 1,
    req,
  })
  if (existingForm.totalDocs > 0) {
    agencyFormId = existingForm.docs[0]?.id as number
    payload.logger.info('  Agency Activation Form exists, skipping creation')
  } else {
    const created = await payload.create({ collection: 'forms', data: agencyActivationForm, req })
    agencyFormId = created.id as number
    payload.logger.info('  Created Agency Activation Form')
  }

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-agencies.png'),
    'Amerikiosks kiosk activation in a premium venue',
  )

  await upsertPage(
    payload,
    req,
    {
      title: 'For Agencies',
      slug: 'for-agencies',
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
                    text: 'For agencies that need activations people notice.',
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
                    text: 'Use automated retail as a physical media layer — measurable activations, in premium venues, without managing operations or inventory.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Quote an activation',
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
        tags: [{ label: 'Measurable' }, { label: 'Turnkey' }, { label: 'Premium venues' }],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Agency Activations',
          eyebrow: 'REAL ACTIVATIONS',
          heading: 'Real activations, built to be noticed.',
          body: richText(
            'See how campaign briefs turn into physical retail moments in premium venues where your audience already is.',
          ),
          filterTag: 'agency',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Activation Four Variables',
          variant: 'pillar',
          eyebrow: 'FOR AGENCIES',
          heading: 'One activation. Four variables your team controls.',
          subheading:
            'Amerikiosks executes the logistics; your team controls creative and media strategy.',
          items: [
            {
              eyebrow: 'LOCATION',
              title: 'Choose the venue',
              body: richText(
                'Select from premium high-traffic spaces that fit the campaign target.',
              ),
            },
            {
              eyebrow: 'CREATIVITY',
              title: 'Control the expression',
              body: richText(
                'Wraps, screens, assortment, and campaign messages are executed according to your creative direction.',
              ),
            },
            {
              eyebrow: 'LOGISTICS',
              title: 'Zero internal operations',
              body: richText('Installation, setup, teardown, and support run on Amerikiosks.'),
            },
            {
              eyebrow: 'MEASUREMENT',
              title: 'Data to report',
              body: richText(
                'Access interaction and performance metrics to include in the client campaign report.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          blockName: 'Activation Formats',
          eyebrow: 'FORMATS',
          heading: 'Formats ready for your next activation.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          blockName: 'How It Works',
          eyebrow: 'HOW IT WORKS',
          heading: 'From campaign idea to live activation.',
          subheading:
            'Your team defines the creative strategy; Amerikiosks executes the physical logistics end-to-end.',
          steps: [
            {
              title: 'Define the brief',
              body: richText('Campaign objective, target audience, timing, and activation budget.'),
            },
            {
              title: 'Select the venue',
              body: richText(
                'We identify premium spaces aligned with the target and campaign moment.',
              ),
            },
            {
              title: 'Design the activation',
              body: richText(
                'Wrap, screens, assortment, and campaign messages produced according to your creative direction.',
              ),
            },
            {
              title: 'Install and launch',
              body: richText(
                'We coordinate setup, installation, and go-live without your team managing logistics.',
              ),
            },
            {
              title: 'Measure and report',
              body: richText(
                'We deliver interaction and performance data for your client campaign report.',
              ),
            },
          ],
          cta: [
            {
              link: {
                label: 'Quote an activation',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Quote An Activation',
          eyebrow: 'QUOTE AN ACTIVATION',
          heading: 'Answers before your campaign goes live.',
          subheading:
            'A focused form and practical FAQ to qualify the right activation format for your campaign.',
          filterTags: [{ tag: 'agencies' }],
          form: agencyFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Agencies — Amerikiosks',
        description:
          'Turn campaign briefs into measurable physical retail activations in premium venues. Turnkey execution, no operations to manage.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Agencias',
      slug: 'para-agencias',
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
                    text: 'Para agencias que necesitan activaciones que la gente note.',
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
                    text: 'Usa retail automatizado como capa de medios físicos — activaciones medibles, en venues premium, sin gestionar operación ni inventario.',
                  },
                ],
              },
            ],
          },
        },
        links: [
          {
            link: {
              label: 'Cotizar una activación',
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
          eyebrow: 'ACTIVACIONES REALES',
          heading: 'Activaciones reales, construidas para ser notadas.',
          body: richText(
            'Descubre cómo los briefings se convierten en momentos de retail físico en venues premium donde tu audiencia ya está.',
          ),
          filterTag: 'agency',
        },
        {
          blockType: 'cardGrid',
          variant: 'pillar',
          eyebrow: 'PARA AGENCIAS',
          heading: 'Una activación. Cuatro variables que controla tu equipo.',
          subheading:
            'Amerikiosks ejecuta la logística; tu equipo controla la estrategia creativa y de medios.',
          items: [
            {
              eyebrow: 'UBICACIÓN',
              title: 'Elige el venue',
              body: richText(
                'Selecciona entre espacios premium de alto tráfico que encajan con el target de la campaña.',
              ),
            },
            {
              eyebrow: 'CREATIVIDAD',
              title: 'Controla la expresión',
              body: richText(
                'Wraps, pantallas, surtido y mensajes de campaña ejecutados según tu dirección creativa.',
              ),
            },
            {
              eyebrow: 'LOGÍSTICA',
              title: 'Cero operación interna',
              body: richText('Instalación, montaje, desmontaje y soporte corren por Amerikiosks.'),
            },
            {
              eyebrow: 'MEDICIÓN',
              title: 'Datos para reportar',
              body: richText(
                'Accede a métricas de interacción y performance para incluir en el reporte de campaña al cliente.',
              ),
            },
          ],
        },
        {
          blockType: 'formatsGrid',
          eyebrow: 'FORMATOS',
          heading: 'Formatos listos para tu próxima activación.',
          filterTags: machines.map((m) => ({ tag: m.tag })),
        },
        {
          blockType: 'processSteps',
          eyebrow: 'CÓMO FUNCIONA',
          heading: 'De la idea de campaña a la activación en vivo.',
          subheading:
            'Tu equipo define la estrategia creativa; Amerikiosks ejecuta la logística física de extremo a extremo.',
          steps: [
            {
              title: 'Definir el brief',
              body: richText(
                'Objetivo de campaña, audiencia objetivo, timing y presupuesto de activación.',
              ),
            },
            {
              title: 'Seleccionar el venue',
              body: richText(
                'Identificamos espacios premium alineados con el target y el momento de campaña.',
              ),
            },
            {
              title: 'Diseñar la activación',
              body: richText(
                'Wrap, pantallas, surtido y mensajes de campaña producidos según tu dirección creativa.',
              ),
            },
            {
              title: 'Instalar y lanzar',
              body: richText(
                'Coordinamos montaje, instalación y lanzamiento sin que tu equipo gestione la logística.',
              ),
            },
            {
              title: 'Medir y reportar',
              body: richText(
                'Entregamos datos de interacción y performance para tu reporte de campaña al cliente.',
              ),
            },
          ],
          cta: [
            {
              link: {
                label: 'Cotizar una activación',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
        {
          blockType: 'faqWithForm',
          eyebrow: 'COTIZAR UNA ACTIVACIÓN',
          heading: 'Respuestas antes de que tu campaña salga en vivo.',
          subheading:
            'Un formulario enfocado y un FAQ práctico para calificar el formato de activación correcto para tu campaña.',
          filterTags: [{ tag: 'agencies' }],
          form: agencyFormId,
        },
      ],
      meta: {
        title: 'Para Agencias — Amerikiosks',
        description:
          'Convierte briefings en activaciones de retail medibles en venues premium. Ejecución llave en mano, sin operación interna.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Agencies seeding complete.')
}

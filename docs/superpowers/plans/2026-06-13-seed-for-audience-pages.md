# Seed For-Venues / For-Agencies / For-Emerging-Brands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed full pages for `/for-venues`, `/for-agencies`, and `/for-emerging-brands` following the exact same pattern as `seedForBrands` — machines, FAQs, projects, form, and page with EN+ES locales.

**Architecture:** Each audience page gets its own form file (`src/endpoints/seed/<slug>-form.ts`) and page seed file (`src/endpoints/seed/pages/<slug>.ts`), wired into `pages/index.ts`, `route.ts`, and `SeedPanel`. Machine records are seeded with audience-specific tags so `formatsGrid` can filter them per page. Hero and project images reuse existing `public/seed-assets/` assets as placeholders.

**Tech Stack:** TypeScript, Payload CMS Local API, bilingual (EN + ES), `upsertPage` utility, `uploadMedia` utility, `richText` helper.

---

## File Map

| Action | File |
|---|---|
| Create | `src/endpoints/seed/venue-program-form.ts` |
| Create | `src/endpoints/seed/agency-activation-form.ts` |
| Create | `src/endpoints/seed/emerging-brand-form.ts` |
| Create | `src/endpoints/seed/pages/for-venues.ts` |
| Create | `src/endpoints/seed/pages/for-agencies.ts` |
| Create | `src/endpoints/seed/pages/for-emerging-brands.ts` |
| Modify | `src/endpoints/seed/pages/index.ts` |
| Modify | `src/app/(frontend)/next/seed/run/route.ts` |
| Modify | `src/components/SeedPanel/index.tsx` |

---

### Task 1: Create the three Payload form definitions

**Files:**
- Create: `src/endpoints/seed/venue-program-form.ts`
- Create: `src/endpoints/seed/agency-activation-form.ts`
- Create: `src/endpoints/seed/emerging-brand-form.ts`

- [ ] **Step 1: Create venue-program-form.ts**

```ts
// src/endpoints/seed/venue-program-form.ts
import type { RequiredDataFromCollectionSlug } from 'payload'

export const venueProgramForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Venue Program Form',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "¡Gracias! Nos pondremos en contacto pronto.", version: 1 }],
          direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'venues@amerikiosks.com',
      subject: 'New Venue Partnership Request',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new venue partnership request has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'venue-name', blockName: 'venue-name', blockType: 'text', label: 'Nombre del venue', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'venue-type', blockName: 'venue-type', blockType: 'text', label: 'Tipo de venue (hotel, aeropuerto, mall, estadio…)', required: false, width: 50 },
    { name: 'location', blockName: 'location', blockType: 'text', label: 'Ubicación / ciudad', required: false, width: 50 },
    { name: 'available-space', blockName: 'available-space', blockType: 'text', label: 'Espacio disponible aprox.', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Mensaje / notas', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Enviar solicitud de partnership',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

- [ ] **Step 2: Create agency-activation-form.ts**

```ts
// src/endpoints/seed/agency-activation-form.ts
import type { RequiredDataFromCollectionSlug } from 'payload'

export const agencyActivationForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Agency Activation Form',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "¡Gracias! Nos pondremos en contacto pronto.", version: 1 }],
          direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'agencies@amerikiosks.com',
      subject: 'New Agency Activation Request',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new agency activation request has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'agency-name', blockName: 'agency-name', blockType: 'text', label: 'Nombre de la agencia', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'client-brand', blockName: 'client-brand', blockType: 'text', label: 'Cliente / marca de la campaña', required: false, width: 50 },
    { name: 'target-venues', blockName: 'target-venues', blockType: 'text', label: 'Venues objetivo', required: false, width: 50 },
    { name: 'campaign-timeline', blockName: 'campaign-timeline', blockType: 'text', label: 'Timeline de la campaña', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Mensaje / notas', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Cotizar activación',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

- [ ] **Step 3: Create emerging-brand-form.ts**

```ts
// src/endpoints/seed/emerging-brand-form.ts
import type { RequiredDataFromCollectionSlug } from 'payload'

export const emergingBrandForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Emerging Brand Form',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "¡Gracias! Revisaremos tu aplicación pronto.", version: 1 }],
          direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'founders@amerikiosks.com',
      subject: 'New Founder Program Application',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new founder program application has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'brand-name', blockName: 'brand-name', blockType: 'text', label: 'Nombre de la marca', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'product-category', blockName: 'product-category', blockType: 'text', label: 'Categoría de producto', required: false, width: 50 },
    { name: 'brand-stage', blockName: 'brand-stage', blockType: 'text', label: 'Etapa de la marca (pre-seed, seed, post-revenue…)', required: false, width: 50 },
    { name: 'model-interest', blockName: 'model-interest', blockType: 'text', label: 'Modelo de interés (consignación / full-service / servicios)', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Mensaje / notas', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Aplicar al programa founder',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/venue-program-form.ts src/endpoints/seed/agency-activation-form.ts src/endpoints/seed/emerging-brand-form.ts
git commit -m "feat(seed): add form definitions for venue, agency, and emerging-brand pages"
```

---

### Task 2: Create for-venues seed

**Files:**
- Create: `src/endpoints/seed/pages/for-venues.ts`

Machines for venues (4, with tags `venue-lobby`, `venue-waiting`, `venue-common`, `venue-multi`) reuse placeholder images from `public/seed-assets/`. Projects (2) reuse `project-fan-stand.jpg` and `project-airport-retail.png`. Hero uses `hero-for-venues.jpg`.

- [ ] **Step 1: Create src/endpoints/seed/pages/for-venues.ts**

```ts
import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { venueProgramForm } from '../venue-program-form'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const projects = [
  {
    slug: 'venue-hotel-lobby',
    title: 'Passive income in the lobby, without lifting a finger.',
    titleEs: 'Ingresos pasivos en el lobby, sin levantar un dedo.',
    category: 'HOTEL / HOSPITALITY',
    categoryEs: 'HOTEL / HOSPITALIDAD',
    description: 'A premium retail experience that improves venue perception and generates monthly revenue without operational load on your team.',
    descriptionEs: 'Una experiencia de retail premium que mejora la percepción del venue y genera revenue mensual sin carga operativa para tu equipo.',
    asset: 'project-fan-stand.jpg',
    tag: 'venue',
  },
  {
    slug: 'venue-airport-transit',
    title: 'Waiting space turned into a point of sale.',
    titleEs: 'Espacio de espera convertido en punto de venta.',
    category: 'AIRPORT / TRANSIT',
    categoryEs: 'AEROPUERTO / TRÁNSITO',
    description: 'End-to-end operated kiosks in high-traffic zones, where the traveler is already ready to buy.',
    descriptionEs: 'Kiosks operados de extremo a extremo en zonas de alto tráfico, donde el viajero ya está listo para comprar.',
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
    answer: 'None. Installation, initial inventory, and equipment run on Amerikiosks under the full-service model. You only provide the space.',
    answerEs: 'Ninguna. La instalación, el inventario inicial y el equipo corren por cuenta de Amerikiosks bajo el modelo full-service. Solo aportas el espacio.',
    weight: 40,
    tags: ['venues'],
  },
  {
    question: 'Who operates and maintains the machine?',
    questionEs: '¿Quién opera y mantiene la máquina?',
    answer: 'Amerikiosks. Replenishment, maintenance, technical support, and monitoring are our responsibility — your team does not need to intervene.',
    answerEs: 'Amerikiosks. Reabastecimiento, mantenimiento, soporte técnico y monitoreo son responsabilidad nuestra — tu equipo no necesita intervenir.',
    weight: 30,
    tags: ['venues'],
  },
  {
    question: 'How and when do we receive revenue?',
    questionEs: '¿Cómo y cuándo recibimos los ingresos?',
    answer: 'You receive your monthly commission according to the agreed model, along with a sales and performance report per location.',
    answerEs: 'Recibes tu comisión mensual según el modelo acordado, junto con un reporte de ventas y performance por ubicación.',
    weight: 20,
    tags: ['venues'],
  },
  {
    question: 'What happens if the machine fails or needs maintenance?',
    questionEs: '¿Qué pasa si la máquina falla o necesita mantenimiento?',
    answer: 'Our support team monitors remotely and coordinates maintenance without your staff having to manage it.',
    answerEs: 'Nuestro equipo de soporte monitorea remotamente y coordina mantenimiento sin que tu personal tenga que gestionarlo.',
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

  // Delete stub so mediumImpact hero type doesn't conflict with lowImpact stub
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

  // ── Machine records ────────────────────────────────────────────────────────
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
      faqId = existing.docs[0]!.id as number
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
      data: {
        question: faq.questionEs,
        answer: richText(faq.answerEs),
      },
      req: { ...req, locale: 'es' } as PayloadRequest,
    })
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
        data: { title: p.title, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const },
        req: { ...req, locale: 'en' } as PayloadRequest,
      })
      payload.logger.info(`  Updated project: ${p.title}`)
    } else {
      const created = await payload.create({
        collection: 'projects',
        locale: 'en',
        data: { title: p.title, slug: p.slug, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const },
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

  // ── Venue Program Form ─────────────────────────────────────────────────────
  let venueFormId: number
  const existingForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: venueProgramForm.title } },
    limit: 1,
    req,
  })
  if (existingForm.totalDocs > 0) {
    venueFormId = existingForm.docs[0]!.id as number
    payload.logger.info('  Venue Program Form exists, skipping creation')
  } else {
    const created = await payload.create({ collection: 'forms', data: venueProgramForm, req })
    venueFormId = created.id as number
    payload.logger.info('  Created Venue Program Form')
  }

  // ── Hero image ─────────────────────────────────────────────────────────────
  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-venues.jpg'),
    'Amerikiosks kiosk in a premium venue lobby',
  )

  // ── For Venues page ────────────────────────────────────────────────────────
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
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'For venues ready to monetize without the effort.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Turn underutilized space into monthly passive income — turnkey installation, no staff, no civil works, no management on your part.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Start a venue program', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'See case studies', type: 'custom', url: '/insights', appearance: 'outline' } },
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
          body: richText('See how placement and end-to-end operations turn high-traffic spaces into passive monthly revenue.'),
          filterTag: 'venue',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Program Zero Load',
          variant: 'pillar',
          eyebrow: 'FOR VENUES',
          heading: 'One program. Zero operational load for your team.',
          subheading: 'Amerikiosks installs, operates, and maintains the experience — your team only receives the revenue report.',
          items: [
            { eyebrow: 'SPACE', title: 'Leverage your space', body: richText('Convert unused square meters into an asset that generates recurring monthly income.') },
            { eyebrow: 'INSTALLATION', title: 'Zero civil works', body: richText('Turnkey installation: no construction, no additional permits, no interruptions to your daily operation.') },
            { eyebrow: 'OPERATIONS', title: 'Zero load for your staff', body: richText('Replenishment, maintenance, support, and monitoring run on Amerikiosks — your team operates nothing.') },
            { eyebrow: 'REVENUE', title: 'Transparent monthly revenue', body: richText('You receive your monthly commission with clear sales and performance reporting per location.') },
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
          subheading: "You don't need to operate anything. Amerikiosks evaluates, installs, operates, and reports — your team only approves the location.",
          steps: [
            { title: 'Evaluate the space', body: richText('We analyze traffic, layout, and opportunities within your venue to identify the best locations.') },
            { title: 'Define the model', body: richText('We agree on the partnership model (full-service, consignment, or services) according to your operational preference.') },
            { title: 'Install without friction', body: richText('We coordinate turnkey installation with no civil works or interruptions to your operation.') },
            { title: 'Operate end-to-end', body: richText('Replenishment, maintenance, and support run on our account.') },
            { title: 'Receive your revenue', body: richText('Monthly clear reporting of sales, performance, and your commission.') },
          ],
          cta: [{ link: { label: 'Start a venue program', type: 'custom', url: '/contact', appearance: 'default' } }],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Start A Venue Program',
          eyebrow: 'START A PROGRAM',
          heading: 'Answers before your venue earns.',
          subheading: 'A focused form and practical FAQ help qualify the right partnership without turning the page into a generic contact flow.',
          filterTags: [{ tag: 'venues' }],
          form: venueFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Venues — Amerikiosks',
        description: 'Turn underutilized venue space into monthly passive income with a fully managed kiosk program. No staff. No investment.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Venues',
      slug: 'for-venues',
      hero: {
        type: 'mediumImpact',
        media: heroImage.id,
        richText: {
          root: {
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'Para venues listos para monetizar sin esfuerzo.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Convierte espacio subutilizado en ingresos pasivos mensuales — instalación turnkey, sin staff, sin obra civil, sin gestión de tu parte.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Iniciar un programa de venue', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'Ver casos de éxito', type: 'custom', url: '/insights', appearance: 'outline' } },
        ],
      },
      meta: {
        title: 'Para Venues — Amerikiosks',
        description: 'Convierte espacio subutilizado en ingresos pasivos mensuales con un programa de kiosks completamente gestionado.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Venues seeding complete.')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/endpoints/seed/pages/for-venues.ts
git commit -m "feat(seed): add seedForVenues — machines, FAQs, projects, and page EN+ES"
```

---

### Task 3: Create for-agencies seed

**Files:**
- Create: `src/endpoints/seed/pages/for-agencies.ts`

Same pattern as Task 2. 4 machines with tags `agency-campaign`, `agency-popup`, `agency-multi-venue`, `agency-screens`. 2 projects with tag `agency`. Hero uses `hero-for-agencies.png`.

- [ ] **Step 1: Create src/endpoints/seed/pages/for-agencies.ts**

```ts
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
    description: 'Branded kiosks as the physical extension of a media campaign, in the places where your audience already is.',
    descriptionEs: 'Kiosks branded como extensión física de una campaña de medios, en los lugares donde tu audiencia ya está.',
    asset: 'project-fan-stand.jpg',
    tag: 'agency',
  },
  {
    slug: 'agency-product-drop',
    title: 'Launches with immediate physical presence.',
    titleEs: 'Lanzamientos con presencia física inmediata.',
    category: 'PRODUCT DROP / EVENT',
    categoryEs: 'DROP DE PRODUCTO / EVENTO',
    description: 'Temporary activations in high-traffic venues, ready to coincide with your campaign timing.',
    descriptionEs: 'Activaciones temporales en venues de alto tráfico, listas para coincidir con el timing de tu campaña.',
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
    answer: 'Yes. Wraps, screens, assortment, and campaign messaging are produced according to the campaign brief you deliver — your team maintains full creative control.',
    answerEs: 'Sí. Wraps, pantallas, surtido y mensajes se producen según el brief de campaña que entregues — tu equipo mantiene control creativo total.',
    weight: 40,
    tags: ['agencies'],
  },
  {
    question: 'How long does it take to set up an activation?',
    questionEs: '¿Cuánto tiempo toma montar una activación?',
    answer: 'It depends on the format and venue availability, but pop-up formats are designed for fast deployment. We coordinate timing according to your campaign calendar.',
    answerEs: 'Depende del formato y la disponibilidad del venue, pero los formatos pop-up están diseñados para despliegue rápido. Coordinamos timing según tu calendario de campaña.',
    weight: 30,
    tags: ['agencies'],
  },
  {
    question: 'Can multiple venues be activated at the same time?',
    questionEs: '¿Pueden activarse varios venues al mismo tiempo?',
    answer: 'Yes. Multi-venue configurations allow replicating the same activation in different spaces simultaneously.',
    answerEs: 'Sí. Las configuraciones multi-venue permiten replicar la misma activación en distintos espacios de forma simultánea.',
    weight: 20,
    tags: ['agencies'],
  },
  {
    question: 'What performance data do you provide for the client report?',
    questionEs: '¿Qué datos de desempeño entregan para el reporte al cliente?',
    answer: 'We share interaction metrics, sales (if applicable), and performance per location, according to the type of activation.',
    answerEs: 'Compartimos métricas de interacción, ventas (si aplica) y desempeño por ubicación, según el tipo de activación.',
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

  // ── Machines ───────────────────────────────────────────────────────────────
  for (const m of machines) {
    const image = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', m.asset), m.name)
    const existing = await payload.find({ collection: 'machines', where: { slug: { equals: m.slug } }, limit: 1, req })
    let machineId: number
    if (existing.totalDocs > 0) {
      const updated = await payload.update({ collection: 'machines', id: existing.docs[0]?.id as number, locale: 'en', data: { name: m.name, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }] }, req: { ...req, locale: 'en' } as PayloadRequest })
      machineId = updated.id as number
      payload.logger.info(`  Updated machine: ${m.name}`)
    } else {
      const created = await payload.create({ collection: 'machines', locale: 'en', data: { name: m.name, slug: m.slug, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }], layout: [], _status: 'published' }, req: { ...req, locale: 'en' } as PayloadRequest })
      machineId = created.id as number
      payload.logger.info(`  Created machine: ${m.name}`)
    }
    await payload.update({ collection: 'machines', id: machineId, locale: 'es', data: { name: m.nameEs, tagline: m.taglineEs }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── FAQs ───────────────────────────────────────────────────────────────────
  for (const faq of faqs) {
    const existing = await payload.find({ collection: 'faqItems', where: { question: { equals: faq.question } }, locale: 'en', limit: 100, req })
    if (existing.totalDocs > 1) {
      for (const dup of existing.docs.slice(1)) await payload.delete({ collection: 'faqItems', id: dup.id as number, req })
      existing.docs = existing.docs.slice(0, 1)
      existing.totalDocs = 1
    }
    let faqId: number
    if (existing.totalDocs > 0) {
      faqId = existing.docs[0]!.id as number
      await payload.update({ collection: 'faqItems', id: faqId, locale: 'en', data: { question: faq.question, answer: richText(faq.answer), weight: faq.weight, tags: faq.tags.map((label) => ({ label })) }, req: { ...req, locale: 'en' } as PayloadRequest })
      payload.logger.info(`  Updated FAQ: ${faq.question}`)
    } else {
      const created = await payload.create({ collection: 'faqItems', locale: 'en', data: { question: faq.question, answer: richText(faq.answer), weight: faq.weight, tags: faq.tags.map((label) => ({ label })) }, req: { ...req, locale: 'en' } as PayloadRequest })
      faqId = created.id as number
      payload.logger.info(`  Created FAQ: ${faq.question}`)
    }
    await payload.update({ collection: 'faqItems', id: faqId, locale: 'es', data: { question: faq.questionEs, answer: richText(faq.answerEs) }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  for (const p of projects) {
    const image = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', p.asset), p.title)
    const existing = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1, req })
    let projectId: number
    if (existing.totalDocs > 0) {
      projectId = existing.docs[0]?.id as number
      await payload.update({ collection: 'projects', id: projectId, locale: 'en', data: { title: p.title, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const }, req: { ...req, locale: 'en' } as PayloadRequest })
      payload.logger.info(`  Updated project: ${p.title}`)
    } else {
      const created = await payload.create({ collection: 'projects', locale: 'en', data: { title: p.title, slug: p.slug, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const }, req: { ...req, locale: 'en' } as PayloadRequest })
      projectId = created.id as number
      payload.logger.info(`  Created project: ${p.title}`)
    }
    await payload.update({ collection: 'projects', id: projectId, locale: 'es', data: { title: p.titleEs, category: p.categoryEs, description: p.descriptionEs }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── Agency Activation Form ─────────────────────────────────────────────────
  let agencyFormId: number
  const existingForm = await payload.find({ collection: 'forms', where: { title: { equals: agencyActivationForm.title } }, limit: 1, req })
  if (existingForm.totalDocs > 0) {
    agencyFormId = existingForm.docs[0]!.id as number
    payload.logger.info('  Agency Activation Form exists, skipping creation')
  } else {
    const created = await payload.create({ collection: 'forms', data: agencyActivationForm, req })
    agencyFormId = created.id as number
    payload.logger.info('  Created Agency Activation Form')
  }

  const heroImage = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-agencies.png'), 'Amerikiosks kiosk activation in a premium venue')

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
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'For agencies that need activations people notice.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Use automated retail as a physical media layer — measurable activations, in premium venues, without managing operations or inventory.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Quote an activation', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'See case studies', type: 'custom', url: '/insights', appearance: 'outline' } },
        ],
        tags: [
          { label: 'Measurable' },
          { label: 'Turnkey' },
          { label: 'Premium venues' },
        ],
      },
      layout: [
        {
          blockType: 'projectsShowcase',
          blockName: 'Real Agency Activations',
          eyebrow: 'REAL ACTIVATIONS',
          heading: 'Real activations, built to be noticed.',
          body: richText('See how campaign briefs turn into physical retail moments in premium venues where your audience already is.'),
          filterTag: 'agency',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Activation Four Variables',
          variant: 'pillar',
          eyebrow: 'FOR AGENCIES',
          heading: 'One activation. Four variables your team controls.',
          subheading: 'Amerikiosks executes the logistics; your team controls creative and media strategy.',
          items: [
            { eyebrow: 'LOCATION', title: 'Choose the venue', body: richText('Select from premium high-traffic spaces that fit the campaign target.') },
            { eyebrow: 'CREATIVITY', title: 'Control the expression', body: richText('Wraps, screens, assortment, and campaign messages are executed according to your creative direction.') },
            { eyebrow: 'LOGISTICS', title: 'Zero internal operations', body: richText('Installation, setup, teardown, and support run on Amerikiosks.') },
            { eyebrow: 'MEASUREMENT', title: 'Data to report', body: richText('Access interaction and performance metrics to include in the client campaign report.') },
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
          subheading: 'Your team defines the creative strategy; Amerikiosks executes the physical logistics end-to-end.',
          steps: [
            { title: 'Define the brief', body: richText('Campaign objective, target audience, timing, and activation budget.') },
            { title: 'Select the venue', body: richText('We identify premium spaces aligned with the target and campaign moment.') },
            { title: 'Design the activation', body: richText('Wrap, screens, assortment, and campaign messages produced according to your creative direction.') },
            { title: 'Install and launch', body: richText('We coordinate setup, installation, and go-live without your team managing logistics.') },
            { title: 'Measure and report', body: richText('We deliver interaction and performance data for your client campaign report.') },
          ],
          cta: [{ link: { label: 'Quote an activation', type: 'custom', url: '/contact', appearance: 'default' } }],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Quote An Activation',
          eyebrow: 'QUOTE AN ACTIVATION',
          heading: 'Answers before your campaign goes live.',
          subheading: 'A focused form and practical FAQ to qualify the right activation format for your campaign.',
          filterTags: [{ tag: 'agencies' }],
          form: agencyFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Agencies — Amerikiosks',
        description: 'Turn campaign briefs into measurable physical retail activations in premium venues. Turnkey execution, no operations to manage.',
        image: heroImage.id,
      },
    },
    {
      title: 'Para Agencias',
      slug: 'for-agencies',
      hero: {
        type: 'mediumImpact',
        media: heroImage.id,
        richText: {
          root: {
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'Para agencias que necesitan activaciones que la gente note.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Usa retail automatizado como capa de medios físicos — activaciones medibles, en venues premium, sin gestionar operación ni inventario.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Cotizar una activación', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'Ver casos de éxito', type: 'custom', url: '/insights', appearance: 'outline' } },
        ],
      },
      meta: {
        title: 'Para Agencias — Amerikiosks',
        description: 'Convierte briefings en activaciones de retail medibles en venues premium. Ejecución llave en mano, sin operación interna.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Agencies seeding complete.')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/endpoints/seed/pages/for-agencies.ts
git commit -m "feat(seed): add seedForAgencies — machines, FAQs, projects, and page EN+ES"
```

---

### Task 4: Create for-emerging-brands seed

**Files:**
- Create: `src/endpoints/seed/pages/for-emerging-brands.ts`

4 machines with tags `emerging-pilot`, `emerging-founder`, `emerging-multi`, `emerging-consignment`. 2 projects with tag `emerging`. Hero reuses `hero-for-brands.png`.

- [ ] **Step 1: Create src/endpoints/seed/pages/for-emerging-brands.ts**

```ts
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
    description: 'An emerging brand tests its product in the real world, in a high-traffic space, without opening a store.',
    descriptionEs: 'Una marca emergente prueba su producto en el mundo real, en un espacio de alto tráfico, sin abrir tienda.',
    asset: 'project-fan-stand.jpg',
    tag: 'emerging',
  },
  {
    slug: 'emerging-multi-location',
    title: 'Real data before committing budget.',
    titleEs: 'Datos reales antes de comprometer presupuesto.',
    category: 'MULTI-LOCATION VALIDATION',
    categoryEs: 'VALIDACIÓN MULTI-UBICACIÓN',
    description: 'Real sales and inventory results per location, used to decide where to scale first.',
    descriptionEs: 'Resultados de ventas e inventario por ubicación, usados para decidir dónde escalar primero.',
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
    answer: 'It depends on the model chosen. Under consignment, your initial investment is only the inventory — Amerikiosks does not charge for installation or operations until there are sales.',
    answerEs: 'Depende del modelo elegido. Bajo consignación, tu inversión inicial es solo el inventario — Amerikiosks no cobra por instalación ni operación hasta que haya ventas.',
    weight: 40,
    tags: ['emerging-brands'],
  },
  {
    question: 'Can we start with a single location?',
    questionEs: '¿Podemos empezar con una sola ubicación?',
    answer: 'Yes. The single-location pilot is designed exactly for that: validate before committing more resources.',
    answerEs: 'Sí. El piloto de una ubicación está diseñado exactamente para eso: validar antes de comprometer más recursos.',
    weight: 30,
    tags: ['emerging-brands'],
  },
  {
    question: "What happens if the product doesn't perform well at that location?",
    questionEs: '¿Qué pasa si el producto no funciona bien en esa ubicación?',
    answer: 'We use the pilot data to adjust — whether changing the product, location, or model, before thinking about scaling.',
    answerEs: 'Usamos los datos del piloto para ajustar — ya sea cambiar producto, ubicación o modelo, antes de pensar en escalar.',
    weight: 20,
    tags: ['emerging-brands'],
  },
  {
    question: 'How do we apply to the founder program?',
    questionEs: '¿Cómo aplicamos al programa founder?',
    answer: 'Through the contact form, telling us about your brand, current product, and physical distribution objectives.',
    answerEs: 'A través del formulario de contacto, contándonos sobre tu marca, producto actual y objetivos de distribución física.',
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

export const seedForEmergingBrands = async (payload: Payload, req: PayloadRequest): Promise<void> => {
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

  // ── Machines ───────────────────────────────────────────────────────────────
  for (const m of machines) {
    const image = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', m.asset), m.name)
    const existing = await payload.find({ collection: 'machines', where: { slug: { equals: m.slug } }, limit: 1, req })
    let machineId: number
    if (existing.totalDocs > 0) {
      const updated = await payload.update({ collection: 'machines', id: existing.docs[0]?.id as number, locale: 'en', data: { name: m.name, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }] }, req: { ...req, locale: 'en' } as PayloadRequest })
      machineId = updated.id as number
      payload.logger.info(`  Updated machine: ${m.name}`)
    } else {
      const created = await payload.create({ collection: 'machines', locale: 'en', data: { name: m.name, slug: m.slug, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }], layout: [], _status: 'published' }, req: { ...req, locale: 'en' } as PayloadRequest })
      machineId = created.id as number
      payload.logger.info(`  Created machine: ${m.name}`)
    }
    await payload.update({ collection: 'machines', id: machineId, locale: 'es', data: { name: m.nameEs, tagline: m.taglineEs }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── FAQs ───────────────────────────────────────────────────────────────────
  for (const faq of faqs) {
    const existing = await payload.find({ collection: 'faqItems', where: { question: { equals: faq.question } }, locale: 'en', limit: 100, req })
    if (existing.totalDocs > 1) {
      for (const dup of existing.docs.slice(1)) await payload.delete({ collection: 'faqItems', id: dup.id as number, req })
      existing.docs = existing.docs.slice(0, 1)
      existing.totalDocs = 1
    }
    let faqId: number
    if (existing.totalDocs > 0) {
      faqId = existing.docs[0]!.id as number
      await payload.update({ collection: 'faqItems', id: faqId, locale: 'en', data: { question: faq.question, answer: richText(faq.answer), weight: faq.weight, tags: faq.tags.map((label) => ({ label })) }, req: { ...req, locale: 'en' } as PayloadRequest })
      payload.logger.info(`  Updated FAQ: ${faq.question}`)
    } else {
      const created = await payload.create({ collection: 'faqItems', locale: 'en', data: { question: faq.question, answer: richText(faq.answer), weight: faq.weight, tags: faq.tags.map((label) => ({ label })) }, req: { ...req, locale: 'en' } as PayloadRequest })
      faqId = created.id as number
      payload.logger.info(`  Created FAQ: ${faq.question}`)
    }
    await payload.update({ collection: 'faqItems', id: faqId, locale: 'es', data: { question: faq.questionEs, answer: richText(faq.answerEs) }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  for (const p of projects) {
    const image = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', p.asset), p.title)
    const existing = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1, req })
    let projectId: number
    if (existing.totalDocs > 0) {
      projectId = existing.docs[0]?.id as number
      await payload.update({ collection: 'projects', id: projectId, locale: 'en', data: { title: p.title, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const }, req: { ...req, locale: 'en' } as PayloadRequest })
      payload.logger.info(`  Updated project: ${p.title}`)
    } else {
      const created = await payload.create({ collection: 'projects', locale: 'en', data: { title: p.title, slug: p.slug, category: p.category, description: p.description, image: image.id, tags: [{ label: p.tag }], _status: 'published' as const }, req: { ...req, locale: 'en' } as PayloadRequest })
      projectId = created.id as number
      payload.logger.info(`  Created project: ${p.title}`)
    }
    await payload.update({ collection: 'projects', id: projectId, locale: 'es', data: { title: p.titleEs, category: p.categoryEs, description: p.descriptionEs }, req: { ...req, locale: 'es' } as PayloadRequest })
  }

  // ── Emerging Brand Form ────────────────────────────────────────────────────
  let emergingFormId: number
  const existingForm = await payload.find({ collection: 'forms', where: { title: { equals: emergingBrandForm.title } }, limit: 1, req })
  if (existingForm.totalDocs > 0) {
    emergingFormId = existingForm.docs[0]!.id as number
    payload.logger.info('  Emerging Brand Form exists, skipping creation')
  } else {
    const created = await payload.create({ collection: 'forms', data: emergingBrandForm, req })
    emergingFormId = created.id as number
    payload.logger.info('  Created Emerging Brand Form')
  }

  const heroImage = await uploadMedia(payload, req, path.join(process.cwd(), 'public', 'seed-assets', 'hero-for-brands.png'), 'Emerging brand kiosk in a premium venue')

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
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'For emerging brands ready to test the real world.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Reach airports, hotels, and premium venues from day one — without the cost of a commercial store, and with the infrastructure that used to be reserved for big brands.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Apply to the founder program', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'See case studies', type: 'custom', url: '/insights', appearance: 'outline' } },
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
          body: richText('See how emerging brands test physical retail presence in premium venues before committing to a full rollout.'),
          filterTag: 'emerging',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Pilot Four Decisions',
          variant: 'pillar',
          eyebrow: 'FOR EMERGING BRANDS',
          heading: 'One pilot. Four decisions before scaling.',
          subheading: 'Amerikiosks gives you access to premium physical distribution with the lowest possible commitment — you decide what to scale with real data.',
          items: [
            { eyebrow: 'ENTRY', title: 'Low entry cost', body: richText('Access premium venues without the investment required to open a commercial store.') },
            { eyebrow: 'MODEL', title: 'Model flexibility', body: richText('Choose consignment, full-service, or services model according to your stage and available capital.') },
            { eyebrow: 'OPERATIONS', title: 'Zero own infrastructure', body: richText('Amerikiosks operates installation, inventory, and maintenance — you focus on the product.') },
            { eyebrow: 'DATA', title: 'Decide with real data', body: richText('Use sales results per location to decide where and how to scale.') },
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
          subheading: "Without opening a store, without unnecessarily frozen inventory — Amerikiosks gives you the physical channel and the data to decide the next step.",
          steps: [
            { title: 'Apply to the program', body: richText('Tell us about your brand, product, and physical distribution objectives.') },
            { title: 'Choose the model', body: richText('We select together the model (consignment, full-service, or services) according to your stage.') },
            { title: 'Launch your pilot', body: richText('Your product enters a selected premium venue, with installation and operations handled by Amerikiosks.') },
            { title: 'Receive real data', body: richText('Sales, inventory, and purchase behavior per location, without needing your own team.') },
            { title: 'Decide how to scale', body: richText('Use the pilot results to decide new locations or adjust the model.') },
          ],
          cta: [{ link: { label: 'Apply to the founder program', type: 'custom', url: '/contact', appearance: 'default' } }],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Apply To Founder Program',
          eyebrow: 'APPLY TO THE PROGRAM',
          heading: 'Answers before your brand launches.',
          subheading: 'A focused form and practical FAQ to qualify the right model for your brand stage.',
          filterTags: [{ tag: 'emerging-brands' }],
          form: emergingFormId,
        },
      ],
      _status: 'published',
      meta: {
        title: 'For Emerging Brands — Amerikiosks',
        description: 'Test real-world retail in premium venues from day one — low entry cost, real data, and infrastructure to scale.',
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
            type: 'root', version: 1, direction: null, format: '' as const, indent: 0,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'Para marcas emergentes listas para probar el mundo real.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Llega a aeropuertos, hoteles y venues premium desde el primer día — sin el costo de un local comercial, y con la infraestructura que antes solo tenían las marcas grandes.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Aplicar al programa founder', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'Ver casos de éxito', type: 'custom', url: '/insights', appearance: 'outline' } },
        ],
      },
      meta: {
        title: 'Para Marcas Emergentes — Amerikiosks',
        description: 'Prueba tu presencia retail en el mundo real desde el primer día — bajo costo de entrada, datos reales e infraestructura para escalar.',
        image: heroImage.id,
      },
    },
  )

  payload.logger.info('— For Emerging Brands seeding complete.')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/endpoints/seed/pages/for-emerging-brands.ts
git commit -m "feat(seed): add seedForEmergingBrands — machines, FAQs, projects, and page EN+ES"
```

---

### Task 5: Wire up all three seeds

**Files:**
- Modify: `src/endpoints/seed/pages/index.ts`
- Modify: `src/app/(frontend)/next/seed/run/route.ts`
- Modify: `src/components/SeedPanel/index.tsx`

- [ ] **Step 1: Update src/endpoints/seed/pages/index.ts**

Add imports after the existing `seedForBrands` import:

```ts
import { seedForAgencies } from './for-agencies'
import { seedForEmergingBrands } from './for-emerging-brands'
import { seedForVenues } from './for-venues'
```

In `seedPages`, add the three new seed calls **after** `seedForBrands` and **before** `seedAudiencePages`:

Replace this block:
```ts
  const whoItsForId = await seedWhoItsFor(payload, req)
  await seedForBrands(payload, req)
  const { pageIds, mediaIds } = await seedAudiencePages(payload, req, whoItsForId)
```

With:
```ts
  const whoItsForId = await seedWhoItsFor(payload, req)
  await seedForBrands(payload, req)
  await seedForVenues(payload, req)
  await seedForAgencies(payload, req)
  await seedForEmergingBrands(payload, req)
  const { pageIds, mediaIds } = await seedAudiencePages(payload, req, whoItsForId)
```

Also add the pre-seed deletes for each new page at the top of `seedPages`, after the existing `for-brands` delete block. Add for each of `for-venues`, `for-agencies`, `for-emerging-brands`:

```ts
  for (const slug of ['for-venues', 'for-agencies', 'for-emerging-brands']) {
    const stale = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
      req,
    })
    if (stale.docs.length > 0) {
      await payload.delete({ collection: 'pages', id: stale.docs[0]?.id, req, overrideAccess: true })
    }
  }
```

- [ ] **Step 2: Update route.ts — add parts and blob stems**

In `src/app/(frontend)/next/seed/run/route.ts`, add imports at the top (after existing audience/page imports):

```ts
import { seedForAgencies } from '@/endpoints/seed/pages/for-agencies'
import { seedForEmergingBrands } from '@/endpoints/seed/pages/for-emerging-brands'
import { seedForVenues } from '@/endpoints/seed/pages/for-venues'
```

Add to `parts` record (after `'for-brands': seedForBrands`):

```ts
  'for-venues': seedForVenues,
  'for-agencies': seedForAgencies,
  'for-emerging-brands': seedForEmergingBrands,
```

No new blob stems needed — all images reuse existing `public/seed-assets/` files already in `seedStems`.

- [ ] **Step 3: Update SeedPanel/index.tsx — add buttons**

In `src/components/SeedPanel/index.tsx`, add to the `PARTS` array after `{ key: 'for-brands', label: 'For Brands' }`:

```ts
  { key: 'for-venues', label: 'For Venues' },
  { key: 'for-agencies', label: 'For Agencies' },
  { key: 'for-emerging-brands', label: 'For Emerging Brands' },
```

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/pages/index.ts src/app/\(frontend\)/next/seed/run/route.ts src/components/SeedPanel/index.tsx
git commit -m "feat(seed): wire for-venues, for-agencies, for-emerging-brands into seedPages, route, and SeedPanel"
```

---

### Task 6: Test and verify

- [ ] **Step 1: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run seed all**

With dev server running, POST to `/next/seed/run` (or click "Seed All" in admin SeedPanel at `/admin`).

Expected log output:
```
— Seeding For Venues page...
  Created/Updated machine: Lobby & Reception
  ...
— For Venues seeding complete.
— Seeding For Agencies page...
  ...
— For Agencies seeding complete.
— Seeding For Emerging Brands page...
  ...
— For Emerging Brands seeding complete.
```

- [ ] **Step 3: Verify pages render**

Visit:
- `http://localhost:3000/for-venues`
- `http://localhost:3000/for-agencies`
- `http://localhost:3000/for-emerging-brands`
- `http://localhost:3000/es/for-venues`
- `http://localhost:3000/es/for-agencies`
- `http://localhost:3000/es/for-emerging-brands`

Each should show: hero → projects showcase → card grid → formats grid → process steps → FAQ + form.

- [ ] **Step 4: Commit if all OK**

```bash
git add -A
git commit -m "chore: verify seed for for-venues, for-agencies, for-emerging-brands"
```

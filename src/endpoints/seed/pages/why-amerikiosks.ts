import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Why Amerikiosks',
  tags: [{ label: 'Turnkey' }, { label: 'Data-driven' }, { label: 'Scalable' }],
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Why Amerikiosks',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'A fully managed kiosk platform built for brands that want presence without the operational burden.',
              version: 1,
            },
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
  },
}

const esHeroData = {
  ...heroData,
  breadcrumb: 'Inicio / Por Qué Amerikiosks',
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Por Qué Amerikiosks',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Una plataforma de kioscos totalmente gestionada, diseñada para marcas que quieren presencia sin la carga operativa.',
              version: 1,
            },
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
  },
}

function richText(text: string) {
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

const cardGridBlock = {
  blockType: 'cardGrid' as const,
  blockName: 'Card Grid — Why Amerikiosks',
  variant: 'pillar' as const,
  eyebrow: 'WHY AMERIKIOSKS',
  heading: 'Built to feel premium.\nOperated to stay that way.',
  subheading:
    'From the first opportunity to daily operation, Amerikiosks turns a location, campaign, or brand goal into a managed retail experience.',
  link: { type: 'custom' as const, label: 'Learn More', url: '/why-amerikiosks' },
  items: [
    {
      eyebrow: 'STRATEGY',
      title: 'Define the moment',
      body: richText(
        'We identify the venue, audience, product mix, and intent behind the placement.',
      ),
    },
    {
      eyebrow: 'EXPERIENCE',
      title: 'Design the experience',
      body: richText(
        'Branding, assortment, machine wrap, screens, and campaign tie come together.',
      ),
    },
    {
      eyebrow: 'LAUNCH',
      title: 'Launch with one partner',
      body: richText('Install, coordination, rollout, and support move through one team.'),
    },
    {
      eyebrow: 'OPERATIONS',
      title: 'Operate and optimize',
      body: richText('Replenishment, maintenance, monitoring, and performance keep it ready.'),
    },
  ],
}

const cardGridBlockEs = {
  ...cardGridBlock,
  eyebrow: 'POR QUÉ AMERIKIOSKS',
  heading: 'Diseñado para sentirse premium.\nOperado para mantenerse así.',
  subheading:
    'Desde la primera oportunidad hasta la operación diaria, Amerikiosks convierte una ubicación, campaña o meta de marca en una experiencia de retail gestionada.',
  link: { type: 'custom' as const, label: 'Saber más', url: '/why-amerikiosks' },
  items: [
    {
      eyebrow: 'ESTRATEGIA',
      title: 'Define el momento',
      body: richText(
        'Identificamos el venue, la audiencia, el mix de producto y la intención detrás del placement.',
      ),
    },
    {
      eyebrow: 'EXPERIENCIA',
      title: 'Diseña la experiencia',
      body: richText('Branding, surtido, wrap de máquina, pantallas y campaña se integran.'),
    },
    {
      eyebrow: 'LANZAMIENTO',
      title: 'Lanza con un solo partner',
      body: richText('Instalación, coordinación, rollout y soporte avanzan por un solo equipo.'),
    },
    {
      eyebrow: 'OPERACIONES',
      title: 'Opera y optimiza',
      body: richText('Reposición, mantenimiento, monitoreo y performance siempre listos.'),
    },
  ],
}

export const seedWhyAmerikiosks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding why-amerikiosks page...')
  await upsertPage(
    payload,
    req,
    { title: 'Why Amerikiosks', slug: 'why-amerikiosks', hero: heroData, layout: [cardGridBlock] },
    {
      title: 'Por Qué Amerikiosks',
      slug: 'por-que-amerikiosks',
      hero: esHeroData,
      layout: [cardGridBlockEs],
    },
  )
}

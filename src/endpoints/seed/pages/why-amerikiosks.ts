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

export const seedWhyAmerikiosks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding why-amerikiosks page...')
  await upsertPage(
    payload,
    req,
    { title: 'Why Amerikiosks', slug: 'why-amerikiosks', hero: heroData },
    { title: 'Por Qué Amerikiosks', slug: 'por-que-amerikiosks', hero: esHeroData },
  )
}

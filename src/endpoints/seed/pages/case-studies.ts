import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Case Studies',
  tags: [{ label: 'Retail' }, { label: 'Venues' }, { label: 'Brands' }],
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
              text: 'Case Studies',
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
              text: 'Read how brands and venues are growing with Amerikiosks.',
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
  breadcrumb: 'Inicio / Casos de Éxito',
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
              text: 'Casos de Éxito',
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
              text: 'Conoce cómo marcas y venues están creciendo con Amerikiosks.',
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

export const seedCaseStudies = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding case-studies page...')
  await upsertPage(
    payload,
    req,
    { title: 'Case Studies', slug: 'case-studies', hero: heroData },
    { title: 'Casos de Éxito', slug: 'casos-de-exito', hero: esHeroData },
  )
}

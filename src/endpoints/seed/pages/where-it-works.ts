import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Where It Works',
  tags: [{ label: 'Malls' }, { label: 'Airports' }, { label: 'Stadiums' }],
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
              text: 'Where It Works',
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
              text: 'Amerikiosks operates in premium venues where foot traffic meets purchasing intent.',
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
  breadcrumb: 'Inicio / Dónde Funciona',
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
              text: 'Dónde Funciona',
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
              text: 'Amerikiosks opera en venues premium donde el tráfico peatonal se encuentra con la intención de compra.',
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

export const seedWhereItWorks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding where-it-works page...')
  await upsertPage(
    payload,
    req,
    { title: 'Where It Works', slug: 'where-it-works', hero: heroData },
    { title: 'Dónde Funciona', slug: 'donde-funciona', hero: esHeroData },
  )
}

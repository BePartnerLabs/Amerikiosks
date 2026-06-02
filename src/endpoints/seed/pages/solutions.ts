import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'

import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

export const seedSolutions = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding solutions page...')

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'src/endpoints/seed/assets/hero-for-brands.png'),
    'Branded kiosk in a shopping mall for brand activations',
  )

  const heroData = {
    type: 'mediumImpact' as const,
    media: heroImage.id,
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Start a Brand Program',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'See case studies',
          url: '/case-studies',
        },
      },
    ],
    breadcrumb: "Home / Who it's for / For brands",
    tags: [{ label: 'Brand-controlled' }, { label: 'Fully managed' }, { label: 'Built to learn' }],
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
                text: 'For brands ready to show up with intent.',
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
                text: 'Launch branded retail experiences in premium venues without building stores, hiring staff, or managing daily operations.',
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

  const esBreadcrumb = 'Inicio / Para quién / Para marcas'
  const esHeroData = {
    ...heroData,
    breadcrumb: esBreadcrumb,
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
                text: 'Para marcas listas para aparecer con intención.',
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
                text: 'Lanza experiencias de retail de marca en venues premium sin construir tiendas, contratar personal ni gestionar operaciones diarias.',
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

  await upsertPage(
    payload,
    req,
    { title: 'Solutions', slug: 'solutions', hero: heroData },
    { title: 'Soluciones', slug: 'soluciones', hero: esHeroData },
  )
}

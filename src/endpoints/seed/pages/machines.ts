import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const richTextHeroEn = {
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'EXPLORE OUR MODELS' }],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Find the right kiosk for your space.',
          },
        ],
      },
    ],
  },
}

const richTextHeroEs = {
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [
          { type: 'text' as const, version: 1 as const, text: 'EXPLORA NUESTROS MODELOS' },
        ],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Encuentra el kiosco ideal para tu espacio.',
          },
        ],
      },
    ],
  },
}

const richTextCta = (text: string) => ({
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading' as const,
        tag: 'h2' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text }],
      },
    ],
  },
})

export const seedMachines = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding machines page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Machines',
      slug: 'machines',
      hero: {
        type: 'simple',
        richText: richTextHeroEn,
        links: [],
      },
      layout: [
        {
          blockType: 'machinesListing',
          blockName: 'Machines Catalog',
          itemsPerPage: 12,
        },
        {
          blockType: 'cta',
          blockName: 'Machines CTA',
          richText: richTextCta('Ready to place a kiosk in your location?'),
          links: [
            {
              link: {
                label: 'Contact Sales',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Máquinas',
      slug: 'machines',
      hero: {
        type: 'simple',
        richText: richTextHeroEs,
        links: [],
      },
      layout: [
        {
          blockType: 'machinesListing',
          blockName: 'Machines Catalog',
          itemsPerPage: 12,
        },
        {
          blockType: 'cta',
          blockName: 'Machines CTA',
          richText: richTextCta('¿Listo para colocar un kiosco en tu ubicación?'),
          links: [
            {
              link: {
                label: 'Contactar ventas',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
      ],
    },
  )
}

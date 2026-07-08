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
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'Customer Service' }],
      },
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Hi! Please choose one of the options below so we can assist you.',
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
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'Servicio al Cliente' }],
      },
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Hola, elige una de las opciones a continuación para poder ayudarte.',
          },
        ],
      },
    ],
  },
}

// Preserves the exact URL printed on physical QR codes on deployed kiosks —
// see docs/analytics-migration-report.md. Rendered via the generic [slug]
// route (single top-level segment, no nesting needed for this one).
export const seedCustomerService = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding customer-service page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Customer Service',
      slug: 'customer-service',
      hero: { type: 'lowImpact', richText: richTextHeroEn, links: [] },
      layout: [
        {
          blockType: 'supportHub',
          phoneNumber: '+18885093699',
          whatsappNumber: '+18885093699',
          refundFormUrl: '/customer-service/request-a-refund',
        },
      ],
      _status: 'published',
    },
    {
      title: 'Servicio al Cliente',
      slug: 'servicio-al-cliente',
      hero: { type: 'lowImpact', richText: richTextHeroEs },
    },
  )
}

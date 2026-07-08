import type { Block } from 'payload'

export const SupportHub: Block = {
  slug: 'supportHub',
  interfaceName: 'SupportHubBlock',
  fields: [
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      defaultValue: '+18885093699',
      admin: { description: 'E.164 format, e.g. +18885093699' },
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      required: true,
      defaultValue: '+18885093699',
      admin: { description: 'E.164 format, e.g. +18885093699' },
    },
    {
      name: 'refundFormUrl',
      type: 'text',
      required: true,
      defaultValue: '/customer-service/request-a-refund',
    },
  ],
  graphQL: {
    singularName: 'SupportHubBlock',
  },
  labels: {
    plural: 'Support Hub Blocks',
    singular: 'Support Hub Block',
  },
}

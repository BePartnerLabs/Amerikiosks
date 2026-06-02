import type { Block } from 'payload'

export const TrustStrip: Block = {
  slug: 'trustStrip',
  interfaceName: 'TrustStripBlock',
  labels: {
    singular: 'Trust Strip',
    plural: 'Trust Strips',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      admin: {
        description: 'Small label above the heading, e.g. "WHO WE WORK WITH"',
      },
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      required: true,
      localized: true,
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Limit',
      defaultValue: 0,
      admin: {
        description: 'Max number of partners to show. 0 = show all.',
      },
    },
  ],
}

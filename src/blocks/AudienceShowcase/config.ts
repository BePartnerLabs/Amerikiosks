import type { Block } from 'payload'

export const AudienceShowcase: Block = {
  slug: 'audienceShowcase',
  interfaceName: 'AudienceShowcaseBlock',
  labels: { singular: 'Audience Showcase', plural: 'Audience Showcases' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "WHO IT\'S FOR"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subheading',
      type: 'text',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: { description: 'Pulls title + hero image from this page automatically.' },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: { description: 'Overrides the page title on the card if set.' },
        },
        {
          name: 'cta',
          type: 'text',
          localized: true,
          admin: { description: 'CTA link label, e.g. "Explore brand programs"' },
        },
      ],
    },
  ],
}

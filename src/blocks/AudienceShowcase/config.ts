import type { Block } from 'payload'

export const AudienceShowcase: Block = {
  slug: 'audienceShowcase',
  interfaceName: 'AudienceShowcaseBlock',
  imageURL: '/block-previews/audience-showcase.png',
  imageAltText: 'Audience Showcase block — 2×2 image overlay card grid',
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
          admin: { description: 'Pulls title and description from this page.' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Card background image.' },
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

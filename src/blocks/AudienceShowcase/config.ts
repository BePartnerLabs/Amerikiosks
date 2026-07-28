import type { Block } from 'payload'

export const AudienceShowcase: Block = {
  slug: 'audienceShowcase',
  interfaceName: 'AudienceShowcaseBlock',
  imageURL: '/block-previews/audience-showcase.png',
  imageAltText: 'Audience Showcase block — 2×2 image overlay card grid',
  labels: {
    singular: { en: 'Audience Showcase', es: 'Vitrina de Audiencia' },
    plural: { en: 'Audience Showcases', es: 'Vitrinas de Audiencia' },
  },
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
      admin: {
        description:
          'Para destacar una palabra o frase en negrita, envuélvela en asteriscos dobles: **texto**',
      },
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
          name: 'target',
          type: 'select',
          defaultValue: 'page',
          options: [
            { label: 'Link to a page', value: 'page' },
            { label: 'Open a modal form', value: 'form' },
          ],
          admin: { description: 'What happens when the card is clicked.' },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          // Not `required` — admin.condition is UI-only, so a hard required
          // would still fail validation for form-target cards.
          validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
            const target = (siblingData as { target?: string } | undefined)?.target
            if (target !== 'form' && !value) return 'This field is required.'
            return true
          },
          admin: {
            condition: (_, siblingData) => siblingData?.target !== 'form',
            description: 'Pulls title and description from this page.',
          },
        },
        {
          name: 'form',
          type: 'relationship',
          relationTo: 'forms',
          validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
            const target = (siblingData as { target?: string } | undefined)?.target
            if (target === 'form' && !value) return 'This field is required.'
            return true
          },
          admin: {
            condition: (_, siblingData) => siblingData?.target === 'form',
            description: 'Opens this form in a modal drawer instead of navigating.',
          },
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
          admin: {
            description: 'Overrides the card title. If not set, defaults to the linked page title.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          admin: {
            description:
              'Overrides the card description. If not set, defaults to the linked page SEO description.',
          },
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

import type { Block } from 'payload'

export const FormatsGrid: Block = {
  slug: 'formatsGrid',
  interfaceName: 'FormatsGridBlock',
  imageURL: '/block-previews/formats-grid.png',
  imageAltText: 'Formats Grid block — machine format card grid',
  labels: {
    singular: { en: 'Formats Grid', es: 'Grilla de Formatos' },
    plural: { en: 'Formats Grids', es: 'Grillas de Formatos' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "FORMATS"' },
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
      name: 'filterTags',
      type: 'array',
      admin: {
        description:
          'Show machines matching these tags. Leave empty to show all. Ignored if items are set.',
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'items',
      type: 'array',
      admin: { description: 'Explicit machine picks. Overrides filterTags.' },
      fields: [
        {
          name: 'machine',
          type: 'relationship',
          relationTo: 'machines',
          required: true,
        },
      ],
    },
  ],
}

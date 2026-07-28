import type { Block } from 'payload'

export const ModelLines: Block = {
  slug: 'modelLines',
  interfaceName: 'ModelLinesBlock',
  imageURL: '/block-previews/model-lines.png',
  imageAltText: 'Model Lines block — machine family row',
  labels: {
    singular: { en: 'Model Lines', es: 'Líneas de Modelos' },
    plural: { en: 'Model Lines', es: 'Líneas de Modelos' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "OUR RANGE"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Discover our model lines',
    },
    {
      name: 'subheading',
      type: 'text',
      localized: true,
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Form to open',
      admin: {
        description:
          'Optional. If set, clicking a model line opens this form in a modal drawer instead of navigating to the family page.',
      },
    },
  ],
}

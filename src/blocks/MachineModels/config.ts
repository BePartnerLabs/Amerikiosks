import type { Block } from 'payload'

export const MachineModels: Block = {
  slug: 'machineModels',
  interfaceName: 'MachineModelsBlock',
  imageURL: '/block-previews/machine-models.png',
  imageAltText: 'Machine Models block — every model in one carousel',
  labels: {
    singular: { en: 'Machine Models', es: 'Modelos de Máquinas' },
    plural: { en: 'Machine Models', es: 'Modelos de Máquinas' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'The range',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Every model we build',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      defaultValue: 'See machine',
      admin: { description: 'Link text on each card.' },
    },
    {
      name: 'family',
      type: 'relationship',
      relationTo: 'machine-families',
      admin: {
        description:
          'Optional. Leave empty to show every model across all families — the usual case. Set one to narrow this block to a single line.',
      },
    },
  ],
}

import type { Block } from 'payload'

export const Metrics: Block = {
  slug: 'metrics',
  interfaceName: 'MetricsBlock',
  imageURL: '/block-previews/metrics.png',
  imageAltText: 'Metrics block — heading with a row of key stats and an optional CTA',
  labels: {
    singular: { en: 'Metrics', es: 'Métricas' },
    plural: { en: 'Metrics', es: 'Métricas' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: {
        description: 'Small label above the heading, e.g. "WHY AMERIKIOSKS"',
      },
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description:
          'Para destacar una palabra o frase en negrita, envuélvela en asteriscos dobles: **texto**',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      localized: true,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "10+", "1000+", "30"' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Years of Industry Experience"' },
        },
      ],
    },
    {
      name: 'link',
      type: 'group',
      label: 'CTA Button',
      admin: {
        description: 'Optional button shown below the stats.',
      },
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'url', type: 'text' },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Custom URL', value: 'custom' },
            { label: 'Internal page', value: 'reference' },
          ],
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: 'pages',
          admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
        },
      ],
    },
  ],
}

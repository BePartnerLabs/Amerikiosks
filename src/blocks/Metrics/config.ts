import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

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
    linkGroup({
      appearances: false,
      overrides: {
        maxRows: 1,
        admin: {
          initCollapsed: true,
          description:
            'Optional CTA button shown below the stats. Can link to a page, a custom URL, or open a form in a modal.',
        },
      },
    }),
  ],
}

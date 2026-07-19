import type { Block } from 'payload'

export const InsightsShowcase: Block = {
  slug: 'insightsShowcase',
  interfaceName: 'InsightsShowcaseBlock',
  imageURL: '/block-previews/insights-showcase.png',
  imageAltText: 'Insights Showcase — featured hero + 3 cards',
  labels: { singular: 'Insights Showcase', plural: 'Insights Showcases' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "INSIGHTS"' },
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
  ],
}

import type { Block } from 'payload'

export const TrustStrip: Block = {
  slug: 'trustStrip',
  interfaceName: 'TrustStripBlock',
  imageURL: '/block-previews/trust-strip.png',
  imageAltText: 'Trust Strip block — partner logos carousel',
  labels: {
    singular: { en: 'Trust Strip', es: 'Franja de Confianza' },
    plural: { en: 'Trust Strips', es: 'Franjas de Confianza' },
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
      admin: {
        description:
          'Para destacar una palabra o frase en negrita, envuélvela en asteriscos dobles: **texto**',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      localized: true,
      admin: {
        description: 'Optional text below the heading.',
      },
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

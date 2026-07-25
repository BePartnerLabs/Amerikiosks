import type { Block } from 'payload'

export const Statement: Block = {
  slug: 'statement',
  interfaceName: 'StatementBlock',
  imageURL: '/block-previews/statement.png',
  imageAltText: 'Statement block — full-bleed brand manifesto',
  labels: {
    singular: { en: 'Statement', es: 'Declaración' },
    plural: { en: 'Statements', es: 'Declaraciones' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: {
        description: 'Small label above the statement, e.g. "Our Philosophy"',
      },
    },
    {
      name: 'statement',
      type: 'text',
      label: 'Statement',
      required: true,
      localized: true,
      admin: {
        description:
          'The single sentence shown large, e.g. "The right brand, in the right place, at the right moment." Para destacar una palabra en negrita, envuélvela en asteriscos dobles: **texto**',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      localized: true,
      admin: {
        description: 'Optional supporting text below the statement.',
      },
    },
  ],
}

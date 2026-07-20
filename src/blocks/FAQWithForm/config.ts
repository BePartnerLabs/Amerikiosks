import type { Block } from 'payload'

export const FAQWithForm: Block = {
  slug: 'faqWithForm',
  interfaceName: 'FAQWithFormBlock',
  imageURL: '/block-previews/faq-with-form.png',
  imageAltText: 'FAQ with Form block — accordion FAQ + lead capture form',
  labels: {
    singular: { en: 'FAQ With Form', es: 'FAQ con Formulario' },
    plural: { en: 'FAQ With Forms', es: 'FAQ con Formularios' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "START A PROGRAM"' },
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
      required: true,
      admin: { description: 'Pull FAQItems matching these tags, sorted by weight descending.' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: { description: 'Payload form to render in the form panel (use Forms collection)' },
    },
  ],
}

import type { Block } from 'payload'

export const FAQWithForm: Block = {
  slug: 'faqWithForm',
  interfaceName: 'FAQWithFormBlock',
  imageURL: '/block-previews/faq-with-form.png',
  imageAltText: 'FAQ with Form block — accordion FAQ + lead capture form',
  labels: { singular: 'FAQ With Form', plural: 'FAQ With Forms' },
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
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Heading shown above the form, e.g. "Start a brand program"' },
        },
        {
          name: 'subheading',
          type: 'text',
          localized: true,
          admin: { description: 'Short description below the form heading' },
        },
        {
          name: 'disclaimer',
          type: 'text',
          localized: true,
          admin: { description: 'Small text next to the submit button' },
        },
      ],
    },
  ],
}

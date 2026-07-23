import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

const defaultIntroContent = {
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading' as const,
        tag: 'h2' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'Request a Refund' }],
      },
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: "Hi there, please fill out and submit this form to request a refund. This takes less than 2 minutes — you'll get a copy of your submission by email.",
          },
        ],
      },
    ],
  },
}

export const ClaimForm: Block = {
  slug: 'claimForm',
  interfaceName: 'ClaimFormBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      localized: true,
      defaultValue: defaultIntroContent,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'creditsAvailableYesMessage',
      type: 'textarea',
      localized: true,
      label: 'Credits Available — "Yes" Message',
      admin: {
        description:
          'Shown to cash-refund customers who confirm the machine still shows an available credit — no refund is needed yet.',
      },
      defaultValue:
        'Great! Please press "change" to receive a refund, or select a product and click "Place Order" to continue with the transaction.',
    },
    {
      name: 'creditsAvailableNoMessage',
      type: 'textarea',
      localized: true,
      label: 'Credits Available — "No" Message',
      admin: {
        description:
          'Shown to cash-refund customers who confirm the credit is gone, before they continue into the refund form.',
      },
      defaultValue:
        'We are sorry to hear that. Please continue to provide us with your personal information so our team can issue a refund.',
    },
    {
      name: 'additionalInfoHint',
      type: 'textarea',
      localized: true,
      label: 'Additional Information — Hint',
      defaultValue:
        'Please provide details on the issue. What products were you trying to purchase? Did the machine show any messages on the screen? This feedback is optional and it helps us to improve our service.',
    },
    {
      name: 'submitButtonLabel',
      type: 'text',
      defaultValue: 'Submit claim',
    },
  ],
  graphQL: {
    singularName: 'ClaimFormBlock',
  },
  labels: {
    plural: { en: 'Claim Form Blocks', es: 'Bloques de Formulario de Reclamo' },
    singular: { en: 'Claim Form Block', es: 'Bloque de Formulario de Reclamo' },
  },
}

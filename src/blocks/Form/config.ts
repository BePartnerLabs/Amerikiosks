import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
    // Deliberately the same three field names the mega menu's left panel uses
    // (src/Header/config.ts → megaMenu), so an editor who has filled in one
    // already knows what these do.
    {
      name: 'panelLabel',
      type: 'text',
      label: 'Panel eyebrow',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
        description: 'Small uppercase label above the headline, e.g. "Get in touch".',
      },
    },
    {
      name: 'panelHeadline',
      type: 'text',
      label: 'Panel headline',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
        description: "The hook. Short and specific — this is the panel's whole job.",
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'stacked',
      options: [
        { label: 'Stacked — intro above the form', value: 'stacked' },
        { label: 'Split — intro in a panel beside the form', value: 'split' },
      ],
      admin: {
        description:
          'Split puts the intro content in a dark panel to the left of the fields. Use it on a full page like /contact; it falls back to stacked on narrow screens and inside the modal drawer, which is always too narrow for two columns.',
      },
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: { en: 'Form Blocks', es: 'Bloques de Formulario' },
    singular: { en: 'Form Block', es: 'Bloque de Formulario' },
  },
}

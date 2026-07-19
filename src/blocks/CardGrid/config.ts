import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  imageURL: '/block-previews/card-grid-compact.png',
  imageAltText: 'Card Grid block — compact, icon, and pillar variants',
  labels: { singular: 'Card Grid', plural: 'Card Grids' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'compact',
      options: [
        { label: 'Compact (dark, heading left)', value: 'compact' },
        { label: 'Icon (light, heading top, icons)', value: 'icon' },
        { label: 'Pillar (light, heading top, CTA)', value: 'pillar' },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: {
        description: 'Small label above the heading, e.g. "WHERE IT WORKS"',
      },
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
      label: 'Subheading',
      localized: true,
      admin: {
        description: 'Optional text below the heading. Used in pillar variant.',
        condition: (_, siblingData) => siblingData?.variant === 'pillar',
      },
    },
    {
      name: 'link',
      type: 'group',
      label: 'CTA Button',
      admin: {
        description: 'Optional button shown below cards. Used in pillar variant.',
        condition: (_, siblingData) => siblingData?.variant === 'pillar',
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
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      localized: true,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: 'Card Image',
          admin: { description: 'Optional image shown at the top of the card.' },
        },
        {
          name: 'eyebrow',
          type: 'text',
          label: 'Card Eyebrow',
          admin: { description: 'Small label above the card title. Used in pillar variant.' },
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon',
          admin: { description: 'Icon identifier. Used in icon variant.' },
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'body',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
        {
          name: 'link',
          type: 'group',
          label: 'Card Link',
          admin: { description: 'Optional CTA link per card. Used in icon variant.' },
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
    },
  ],
}

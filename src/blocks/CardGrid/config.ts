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
  labels: {
    singular: { en: 'Card Grid', es: 'Grilla de Tarjetas' },
    plural: { en: 'Card Grids', es: 'Grillas de Tarjetas' },
  },
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
      type: 'textarea',
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
        description: 'Optional text below the heading. Used in compact and pillar variants.',
        condition: (_, siblingData) => siblingData?.variant !== 'icon',
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
      // Localized per-subfield rather than on the array itself: a localized
      // *array* gets a table keyed on `id` alone while carrying a `_locale`
      // column, so the same row id can't exist in two locales. With
      // localization.fallback on, opening an untranslated locale echoes the
      // source locale's row ids straight back on save and the insert dies on
      // the primary key (see the same fix in blocks/Metrics/config.ts).
      // Media, icon and the link target stay shared across locales; only the
      // copy is translated.
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
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
          localized: true,
          admin: { description: 'Small label above the card title. Used in pillar variant.' },
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon',
          admin: { description: 'Icon identifier. Used in icon variant.' },
        },
        { name: 'title', type: 'text', required: true, localized: true },
        {
          name: 'body',
          type: 'richText',
          localized: true,
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
          admin: {
            description:
              'Optional CTA link per card. Used in icon variant. Choose "None" to make the card non-clickable.',
          },
          fields: [
            {
              name: 'type',
              type: 'radio',
              defaultValue: 'custom',
              options: [
                { label: 'None (card not clickable)', value: 'none' },
                { label: 'Custom URL', value: 'custom' },
                { label: 'Internal page', value: 'reference' },
              ],
            },
            {
              name: 'label',
              type: 'text',
              localized: true,
              admin: { condition: (_, siblingData) => siblingData?.type !== 'none' },
            },
            {
              name: 'url',
              type: 'text',
              admin: { condition: (_, siblingData) => siblingData?.type === 'custom' },
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

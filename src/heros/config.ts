import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      localized: true,
    },
    linkGroup({
      appearances: ['default', 'outline', 'ghost'],
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: 'Background image (poster / fallback)',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
        description:
          'For highImpact: used as video poster and img fallback. For mediumImpact: right-column image.',
      },
      relationTo: 'media',
      required: false,
      validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        if (['highImpact', 'mediumImpact'].includes(siblingData?.type as string) && !value) {
          return 'Background image is required for High Impact and Medium Impact heroes.'
        }
        return true
      },
    },
    {
      name: 'backgroundVideo',
      type: 'upload',
      label: 'Background video',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Optional. MP4 recommended. Plays muted + looped over the poster image.',
      },
      relationTo: 'media',
      required: false,
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        condition: (_, { type } = {}) => ['mediumImpact', 'lowImpact'].includes(type),
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  label: false,
}

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const FAQItems: CollectionConfig = {
  slug: 'faqItems',
  admin: {
    defaultColumns: ['question', 'weight', 'updatedAt'],
    useAsTitle: 'question',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      localized: true,
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'weight',
      type: 'number',
      defaultValue: 10,
      admin: {
        description:
          'Higher weight appears first. Use multiples of 10 (10, 20, 30…) so items can be inserted between existing ones.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'e.g. brands, venues, replenishment, branding, pricing' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

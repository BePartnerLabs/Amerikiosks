import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    defaultColumns: ['title', 'category', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  versions: {
    drafts: { autosave: { interval: 100 } },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'category',
      type: 'text',
      localized: true,
      admin: { description: 'Eyebrow label shown on cards, e.g. "FAN STAND"' },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
      admin: { description: 'Short text shown on the card' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'Used to filter projects in blocks, e.g. "brand"' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      editor: defaultLexical,
      localized: true,
    },
  ],
}

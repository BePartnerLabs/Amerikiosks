import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Machines: CollectionConfig = {
  slug: 'machines',
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: { description: 'Short label shown on cards, e.g. "Full-size branded machine"' },
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
      admin: {
        description: 'e.g. full-size, compact, campaign, premium — used for block-level filtering',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [],
    },
  ],
}

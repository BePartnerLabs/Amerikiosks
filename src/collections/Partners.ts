import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    description:
      'Client/venue logos shown in the trust strip on the homepage (e.g. Hilton, Royal Caribbean, CVS). Not related to Brands.',
    defaultColumns: ['name', 'order', 'updatedAt'],
    useAsTitle: 'name',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower number appears first. Use 1, 2, 3… to control display order.',
      },
    },
  ],
}

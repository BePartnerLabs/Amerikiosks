import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
    description:
      "Client brands/product lines sold through Amerikiosks machines (e.g. Carlo's Bakery, Pharmabox by CVS) — not the machine hardware itself, see Machines.",
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
    },
  ],
}

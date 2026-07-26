import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const MachineInstallations: CollectionConfig = {
  slug: 'machine-installations',
  admin: {
    description:
      'Real client installations (photos only) for a specific machine — shown as social proof on its /machines/[family] page.',
    defaultColumns: ['client', 'machine', 'updatedAt'],
    useAsTitle: 'location',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'partners',
      required: true,
      admin: { description: "Uses the partner's existing name and logo" },
    },
    {
      name: 'machine',
      type: 'relationship',
      relationTo: 'machines',
      required: true,
      admin: { description: 'Which model was installed (its family is derived from here)' },
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
    },
    {
      name: 'photos',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}

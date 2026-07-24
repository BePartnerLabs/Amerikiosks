import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    plural: { en: 'Tags', es: 'Tags' },
    singular: { en: 'Tag', es: 'Tag' },
  },
  admin: {
    group: { en: 'Tags', es: 'Tags' },
    useAsTitle: 'label',
    description: {
      en: 'Reusable tags for filtering — used by Machines and the Formats Grid block.',
      es: 'Tags reutilizables para filtrado — usados por Machines y el bloque Formats Grid.',
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'machines',
      type: 'join',
      collection: 'machines',
      on: 'tags',
      admin: {
        description: 'Machines currently using this tag — read-only, for spotting unused tags.',
      },
    },
  ],
}

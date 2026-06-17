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
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'specs',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'value', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', required: true, localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true, defaultValue: 'Request a quote' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'useRotationHero',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show the full rotation-scrub hero instead of the default zoom+fade hero.',
      },
    },
    {
      name: 'rotationFrames',
      type: 'array',
      admin: {
        description:
          'Ordered turntable frames (e.g. 60-120 images, 0-360°). Required when "useRotationHero" is checked.',
        condition: (_, siblingData) => Boolean(siblingData?.useRotationHero),
      },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [],
    },
  ],
}

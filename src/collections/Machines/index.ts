import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
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
      name: 'heroEyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small kicker above the hero title, e.g. "NEXT GENERATION"' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'e.g. full-size, compact, campaign, premium — used for block-level filtering',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
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
      name: 'brochure',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional downloadable brochure (PDF). Hides the "Download brochure" hero button when empty.',
      },
    },
    {
      name: 'highlights',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "WHY GAMMA 13"' },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "Engineered for performance. Designed for any location."' },
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'icon',
              type: 'text',
              admin: { description: 'Material Symbols icon name, e.g. "inventory_2"' },
            },
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'description', type: 'text', localized: true },
          ],
        },
      ],
    },
    {
      name: 'capabilities',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "Built for scale. Designed for ease."' },
        },
        {
          name: 'items',
          type: 'array',
          fields: [{ name: 'text', type: 'text', required: true, localized: true }],
        },
      ],
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        { name: 'height', type: 'text', admin: { description: 'e.g. 92"' } },
        { name: 'width', type: 'text', admin: { description: 'e.g. 74"' } },
        { name: 'depth', type: 'text', admin: { description: 'e.g. 40"' } },
      ],
    },
    {
      name: 'dimensionDiagrams',
      type: 'array',
      admin: { description: 'Labeled technical line-drawings (e.g. front, side, isometric views)' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'label', type: 'text', localized: true },
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
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaImageField({
          relationTo: 'media',
        }),
        MetaDescriptionField({}),
        PreviewField({
          hasGenerateFn: true,
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
        }),
      ],
    },
  ],
}

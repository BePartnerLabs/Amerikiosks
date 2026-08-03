import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { link } from '../../fields/link'
import { generateMachinePreviewPath } from '../../utilities/generateMachinePreviewPath'

export const Machines: CollectionConfig = {
  slug: 'machines',
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
    livePreview: {
      url: ({ data, req }) =>
        generateMachinePreviewPath({ slug: data?.slug, family: data?.family, req }),
    },
    preview: (data, { req }) =>
      generateMachinePreviewPath({
        slug: data?.slug as string,
        family: data?.family as number | string | undefined,
        req,
      }),
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  versions: {
    // No autosave — see the note in Insights. Saving is explicit ("Save draft").
    drafts: true,
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
      admin: { description: 'Front view — shown in the model carousel cards.' },
    },
    {
      name: 'hoverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional side view — swaps in on hover/focus/active over the card. Leave empty to keep showing the front view only.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'machine-tags',
      hasMany: true,
      admin: {
        description: 'e.g. full-size, compact, campaign, premium — used for block-level filtering',
      },
    },
    {
      name: 'family',
      type: 'relationship',
      relationTo: 'machine-families',
      required: true,
      admin: {
        description: 'Product series this model belongs to (e.g. Alpha, Gamma)',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    link({
      overrides: {
        name: 'cta',
        admin: {
          description:
            'Hero call-to-action. Supports linking to a page, a custom URL, or opening a form in a modal (e.g. "Contact Sales" opening a lead form instead of navigating away).',
        },
      },
    }),
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
              admin: {
                description:
                  'Pick from the list. A name typed by hand that is not in the set renders nothing at all, with no error — see src/components/Icon/icons.ts.',
                components: {
                  Field: '@/components/MaterialIconPicker#MaterialIconPicker',
                },
              },
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
          admin: {
            description:
              'Each item can render as a full-bleed alternating story band (image + heading + text) or, if left without an image, as a plain bullet.',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
              localized: true,
              admin: { description: 'Optional short claim, e.g. "Cold, all day."' },
            },
            { name: 'text', type: 'text', required: true, localized: true },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional. When set, this item renders as a full-bleed story band.',
              },
            },
          ],
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
      name: 'specs',
      type: 'array',
      admin: {
        description:
          'Structured spec rows (capacity, power, screen, refrigeration, etc.) sourced from the vendor spec sheet. Drives the family-page comparison table and the model-page spec list. Order here is the display order; use the same "label" text across models in a family so rows line up in the comparison table.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'e.g. "Storage capacity"' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'e.g. "420–560 units"' },
        },
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

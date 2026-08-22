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
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const MachineFamilies: CollectionConfig = {
  slug: 'machine-families',
  admin: {
    description: 'Product series/lines (e.g. Alpha, Gamma, Delta) shown on /machines.',
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'machine-families',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'machine-families',
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
      admin: { description: 'e.g. "Alpha"' },
    },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: {
        description:
          'e.g. "Explore our premium line" — used as the blurb on the home model-lines card',
      },
    },
    {
      name: 'heroEyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small kicker above the family hero heading, e.g. "Next generation"' },
    },
    {
      name: 'heroHeading',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Secondary heading on the family hero, below the family name, e.g. "Hot food, ready in about 50 seconds."',
      },
    },
    {
      name: 'heroLineupImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Composed, no-background render of every model in this family, used as the family hero visual (text sits over it).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Hero sub-copy (the "bajada") shown below heroHeading.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Front view — shown in the model-lines carousel cards.' },
    },
    {
      name: 'rowImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Front view cropped tight to the machine, for the rows on /machines where it leans out over the top of its card. A separate field on purpose: `thumbnail` is a square canvas with the machine at 29-53% of its width, and the lean-out needs the machine to reach the edge. Cropping `thumbnail` instead would also change the framing of the pinned scene on the same page and of the home carousel, which share that file. Leave it empty and the row falls back to `thumbnail`, flat inside its card.',
      },
    },
    {
      name: 'hoverThumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional side view — swaps in on hover/focus/active over the card. Leave empty to keep showing the front view only.',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Know more',
    },
    {
      name: 'highlights',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
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
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'When set, this item renders as a full-width featured card. Suggested: at least 1200×960px (5:4), landscape, since it fills the card edge-to-edge.',
              },
            },
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'description', type: 'text', localized: true },
            {
              name: 'featured',
              type: 'checkbox',
              // Deliberately not localized: flagging one characteristic in
              // English and a different one in Spanish is not a use case, and
              // this array already carries the localized-subfield hazard where a
              // locale-scoped write without item ids wipes the sibling locale.
              admin: {
                description:
                  'The characteristic this family leads with on /machines. Mark one. If none is marked the first item is used, so a family is never left out of the lineup.',
              },
            },
          ],
        },
      ],
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

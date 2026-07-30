import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { hero } from '@/heros/config'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { AudienceShowcase } from '../../blocks/AudienceShowcase/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { CardGrid } from '../../blocks/CardGrid/config'
import { ClaimForm } from '../../blocks/ClaimForm/config'
import { Content } from '../../blocks/Content/config'
import { FAQWithForm } from '../../blocks/FAQWithForm/config'
import { FormBlock } from '../../blocks/Form/config'
import { FormatsGrid } from '../../blocks/FormatsGrid/config'
import { InsightsShowcase } from '../../blocks/InsightsShowcase/config'
import { MachinesListing } from '../../blocks/MachinesListing/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Metrics } from '../../blocks/Metrics/config'
import { ModelLines } from '../../blocks/ModelLines/config'
import { ProcessSteps } from '../../blocks/ProcessSteps/config'
import { ProjectsShowcase } from '../../blocks/ProjectsShowcase/config'
import { Statement } from '../../blocks/Statement/config'
import { SupportHub } from '../../blocks/SupportHub/config'
import { TrustStrip } from '../../blocks/TrustStrip/config'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { reservedSlug } from './hooks/reservedSlug'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: { en: 'Hero', es: 'Hero' },
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                CardGrid,
                Metrics,
                TrustStrip,
                AudienceShowcase,
                InsightsShowcase,
                ProjectsShowcase,
                FormatsGrid,
                MachinesListing,
                ModelLines,
                ProcessSteps,
                Statement,
                FAQWithForm,
                ClaimForm,
                SupportHub,
              ],
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: { en: 'Content', es: 'Contenido' },
        },
        {
          name: 'meta',
          label: { en: 'SEO', es: 'SEO' },
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
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ useAsSlug: 'title', localized: true }),
  ],
  hooks: {
    beforeValidate: [reservedSlug],
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    // No autosave on purpose — see the note in Insights: a version row every
    // 100ms while typing. Saving is explicit ("Save draft").
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

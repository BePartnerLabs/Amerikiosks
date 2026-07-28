import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin, TextFieldValidation } from 'payload'
import { resyncEndpoint } from '@/collections/FormSubmissions/endpoints/resync'
import { dispatchFormSync } from '@/collections/FormSubmissions/hooks/dispatchFormSync'
import { revalidateFormGlobals } from '@/collections/Forms/hooks/revalidateFormGlobals'
import type { Insight, Machine, Page, Project } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { type MondayBoardsCache, validateMondayColumnId } from '@/utilities/detectMondayDrift'
import { getServerSideURL } from '@/utilities/getURL'
import { amerikiosksRedirectsPlugin } from './redirects'

export const generateTitle: GenerateTitle<Insight | Page | Project | Machine> = ({ doc }) => {
  const label =
    (doc as { title?: string; name?: string })?.title ?? (doc as { name?: string })?.name
  return label ? `${label} | Amerikiosks` : 'Amerikiosks'
}

export const generateURL: GenerateURL<Insight | Page | Project | Machine> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  mcpPlugin({
    collections: {
      machines: { enabled: { find: true, create: true, update: true, delete: true } },
    },
  }),
  // Use Cloudflare R2 (S3-compatible) when credentials are set.
  // Locally, Payload falls back to the staticDir in Media.ts (/public/media).
  ...(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET,
          // Uploads go browser → R2 directly via a presigned URL, bypassing
          // the Vercel serverless function entirely — without this, any file
          // over ~4.5MB hits FUNCTION_PAYLOAD_TOO_LARGE, since the upload
          // would otherwise be proxied through the Payload API function.
          // Requires CORS on the R2 bucket to allow PUT from the site's
          // origin(s) — Cloudflare R2 dashboard → bucket → Settings → CORS
          // Policy (not something this repo's code can configure).
          clientUploads: true,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION ?? 'auto',
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
          },
        }),
      ]
    : []),
  amerikiosksRedirectsPlugin(),
  nestedDocsPlugin({
    collections: ['categories', 'pages'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    generateLabel: (_, doc) => (doc as { title?: string }).title ?? '',
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
      // Not enabled by the plugin's own defaults — required for the
      // kiosk-development/placement-application forms' photo attachment.
      upload: true,
      // Not one of the plugin's builtins — src/blocks/Form/Number already had
      // an unused frontend renderer prepared for this; registering it here
      // gives it a real field-block config to attach to.
      number: {
        slug: 'number',
        fields: [
          { type: 'row', fields: [{ name: 'name', type: 'text', required: true }] },
          { name: 'label', type: 'text', localized: true },
          { name: 'width', type: 'number' },
          { name: 'required', type: 'checkbox' },
        ],
        // biome-ignore lint/suspicious/noExplicitAny: matches a Payload Block shape, not the plugin's own narrower FieldConfig type
      } as any,
    },
    uploadCollections: ['media'],
    formOverrides: {
      hooks: {
        afterChange: [revalidateFormGlobals],
      },
      fields: ({ defaultFields }) => {
        // Per-field-block "externalId" — the Monday column id that field's
        // value maps to (see GenericMondayRepository). Added to every block
        // type except message/payment, which never carry submission data.
        const fieldsBlocksField = defaultFields.find(
          (field) => 'name' in field && field.name === 'fields',
        )
        if (fieldsBlocksField && 'blocks' in fieldsBlocksField) {
          for (const block of fieldsBlocksField.blocks) {
            if (block.slug === 'message' || block.slug === 'payment') continue
            block.fields.push({
              name: 'externalId',
              type: 'text',
              admin: {
                description:
                  'Monday.com column id this field\'s value maps to (e.g. "text7", "dropdown0"). Leave blank to exclude this field from the sync.',
              },
              validate: (async (value: string | null | undefined, { data, req }) => {
                const boardId = (data as { externalId?: string })?.externalId
                if (!boardId) return true
                const settings = await req.payload.findGlobal({ slug: 'settings', req })
                return validateMondayColumnId(
                  value,
                  boardId,
                  settings.mondayBoardsCache as MondayBoardsCache | undefined,
                  block.slug,
                )
              }) as TextFieldValidation,
            })
          }
        }

        return defaultFields
          .map((field) => {
            if ('name' in field && field.name === 'confirmationMessage') {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      FixedToolbarFeature(),
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    ]
                  },
                }),
              }
            }
            return field
          })
          .concat([
            {
              name: 'integrationTarget',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Monday.com', value: 'monday' },
                { label: 'Odoo', value: 'odoo' },
              ],
              admin: {
                position: 'sidebar',
                description:
                  'External system this form syncs submissions to. Odoo is not yet implemented — reserved for when that integration is ready.',
              },
            },
            {
              name: 'externalId',
              type: 'text',
              admin: {
                position: 'sidebar',
                condition: (data) => data?.integrationTarget && data.integrationTarget !== 'none',
                description:
                  'The Monday.com board id (or future Odoo record id) this form syncs to.',
                components: {
                  Field: '@/plugins/components/MondayBoardPicker#MondayBoardPicker',
                },
              },
            },
            {
              name: 'mondayGroupId',
              type: 'text',
              admin: {
                position: 'sidebar',
                condition: (data) => data?.integrationTarget === 'monday',
                description: 'Monday.com group id within the board (e.g. "topics").',
                components: {
                  Field: '@/plugins/components/MondayGroupPicker#MondayGroupPicker',
                },
              },
            },
            {
              name: 'mondayColumnsReferenceUi',
              type: 'ui',
              admin: {
                position: 'sidebar',
                condition: (data) => data?.integrationTarget === 'monday',
                components: {
                  Field: '@/plugins/components/MondayColumnsReference#MondayColumnsReference',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              admin: {
                description:
                  'Short paragraph shown under the form title. This is what appears inside the modal drawer, which has no block-level intro of its own.',
              },
            },
            {
              name: 'footnote',
              type: 'richText',
              localized: true,
              admin: {
                description:
                  'Small print under the submit button — reassurance, not instructions (e.g. "No staffing required. Amerikiosks handles placement, setup and daily operations.").',
              },
            },
            {
              name: 'confirmationHeading',
              type: 'text',
              localized: true,
              admin: {
                condition: (data) => data?.confirmationType !== 'redirect',
                description:
                  'Headline of the thank-you state, e.g. "Request received". The rich text below becomes the body.',
              },
            },
            {
              name: 'confirmationNext',
              type: 'text',
              localized: true,
              admin: {
                condition: (data) => data?.confirmationType !== 'redirect',
                description:
                  'What happens next, with a real timeframe — e.g. "We\'ll email you within 2 business days." This is the line that decides whether the site reads as serious.',
              },
            },
            {
              name: 'requiresConsent',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description:
                  'Adds a required consent checkbox above the submit button. Turn this on for any form that collects personal data (name, email, phone). The answer and its timestamp are stored on each submission as proof.',
              },
            },
            {
              name: 'consentText',
              type: 'richText',
              localized: true,
              admin: {
                position: 'sidebar',
                condition: (data) => Boolean(data?.requiresConsent),
                description:
                  'Wording shown next to the consent checkbox. State what the data is used for and link to the privacy policy.',
              },
            },
          ])
      },
    },
    formSubmissionOverrides: {
      admin: {
        components: {
          beforeListTable: [
            '@/collections/FormSubmissions/components/ResyncListButton#ResyncListButton',
          ],
          edit: {
            beforeDocumentControls: [
              '@/collections/FormSubmissions/components/ResyncDocButton#ResyncDocButton',
            ],
          },
        },
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'syncStatus',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Synced', value: 'synced' },
            { label: 'Error', value: 'error' },
          ],
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'syncError',
          type: 'text',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'syncedAt',
          type: 'date',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'consentGiven',
          type: 'checkbox',
          admin: {
            position: 'sidebar',
            readOnly: true,
            description:
              'Whether the visitor ticked the consent box on a form that requires it. Written by the submission route — a consent record only counts if it was stored at the moment of capture.',
          },
        },
        {
          name: 'consentAt',
          type: 'date',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
      ],
      access: {
        // The public path is /next/form-submissions, which rate-limits,
        // screens for bots and validates before writing. Leaving the plugin's
        // own REST endpoint open would be a bypass around all of that.
        create: () => false,
      },
      hooks: {
        afterChange: [dispatchFormSync],
      },
      endpoints: [resyncEndpoint],
    },
  }),
  searchPlugin({
    collections: ['insights'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]

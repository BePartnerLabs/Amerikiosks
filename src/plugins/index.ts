import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin, TextFieldValidation } from 'payload'
import { attachmentUrlEndpoint } from '@/collections/FormSubmissions/endpoints/attachmentUrl'
import { resyncEndpoint } from '@/collections/FormSubmissions/endpoints/resync'
import { revalidateFormGlobals } from '@/collections/Forms/hooks/revalidateFormGlobals'
import type { Insight, Machine, Page, Project } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { buildPublicFileURL } from '@/utilities/buildPublicFileURL'
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

const s3Vars = {
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
}
const s3Missing = Object.entries(s3Vars)
  .filter(([, v]) => !v)
  .map(([k]) => k)
const s3Enabled = s3Missing.length === 0

// All-or-nothing: a partially configured bucket on Vercel would silently write
// uploads to ephemeral serverless disk and 404 every existing R2 URL.
if (!s3Enabled && s3Missing.length < Object.keys(s3Vars).length) {
  const msg = `S3 storage partially configured — missing ${s3Missing.join(', ')}`
  if (process.env.VERCEL) throw new Error(msg)
  console.warn(`[plugins] ${msg}; falling back to local staticDir`)
}

// `forms` has to stay publicly readable: the blocks that render a form
// (AudienceShowcase, FAQWithForm, ModelLines) fetch it through the Local API
// with `overrideAccess: false`, so a public request has no user and an
// authenticated-only collection would return null — the form would vanish from
// the site. What does not belong in the public payload is the integration
// wiring: board ids, group ids and the per-field Monday column mapping. Hidden
// per field instead, which the server still reads because the submission route
// and the sync hook query with `overrideAccess` at its default (true).
//
// Boolean-only by necessity: Payload field-level access cannot return a query.
const integrationFieldAccess = {
  read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
}

export const plugins: Plugin[] = [
  mcpPlugin({
    collections: {
      machines: { enabled: { find: true, create: true, update: true, delete: true } },
    },
  }),
  // Use Cloudflare R2 (S3-compatible) when credentials are set.
  // Locally, Payload falls back to the staticDir in Media.ts (/public/media).
  // S3_PUBLIC_URL is part of the condition, not optional: media URLs are built
  // from it, so without it every image would resolve to a broken path.
  ...(s3Enabled
    ? [
        s3Storage({
          collections: {
            media: {
              // Serve media straight from the public bucket host instead of
              // through Payload's /api/media/file/... route. Without this,
              // Payload keeps access control over the files and proxies every
              // byte out of R2 — a serverless function invocation plus a DB
              // read per image (Media.read is `anyone` anyway), and it puts all
              // site media behind the `maintenance-api` firewall rule that
              // closes /api during a release migration, so images 403 for the
              // length of every deploy.
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => buildPublicFileURL(filename, prefix),
            },
          },
          // biome-ignore lint/style/noNonNullAssertion: s3Enabled guarantees all four vars — TS can't narrow process.env through the boolean
          bucket: process.env.S3_BUCKET!,
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
              // biome-ignore lint/style/noNonNullAssertion: guarded by s3Enabled above
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              // biome-ignore lint/style/noNonNullAssertion: guarded by s3Enabled above
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
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
      // Defined by the plugin but not on by default in this version, so an
      // editor could not add either until they were named here.
      radio: true,
      date: true,
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
      // Also not a plugin builtin. A yes/no question rendered as the same
      // switch the cookie preferences panel uses — stored as a boolean, like
      // `checkbox`; a two-option select costs a click and hides the options.
      toggle: {
        slug: 'toggle',
        fields: [
          { type: 'row', fields: [{ name: 'name', type: 'text', required: true }] },
          { name: 'label', type: 'text', localized: true },
          { name: 'width', type: 'number' },
          { name: 'defaultValue', type: 'checkbox' },
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
        // The plugin exports its block definitions as shared objects, and this
        // config is evaluated more than once (dev hot-reload, repeated
        // imports). Pushing straight onto block.fields therefore appended the
        // same field again on every pass, and Payload refused to boot with
        // "A field with the name 'valueType' was found multiple times".
        // biome-ignore lint/suspicious/noExplicitAny: Payload's Block/Field union is narrower than what the plugin's own block objects satisfy here
        const addOnce = (block: any, field: { name: string } & Record<string, unknown>) => {
          if (block.fields.some((f: { name?: string }) => f.name === field.name)) return
          block.fields.push(field)
        }

        if (fieldsBlocksField && 'blocks' in fieldsBlocksField) {
          for (const block of fieldsBlocksField.blocks) {
            if (block.slug === 'message' || block.slug === 'payment') continue

            // A select, not free text: these are HTML spec tokens, and a typo
            // like "e-mail" fails silently — the browser ignores an unknown
            // token, so nothing autofills and nobody finds out. Labelled in
            // plain language because the person choosing is an editor, not a
            // developer. Off by default: a wrong token is worse than none, e.g.
            // "name" on a company field offers the visitor's own name.
            if (['text', 'email', 'number', 'textarea'].includes(block.slug)) {
              addOnce(block, {
                name: 'autocomplete',
                type: 'select',
                options: [
                  { label: "Don't autofill", value: 'off' },
                  { label: 'Full name', value: 'name' },
                  { label: 'First name', value: 'given-name' },
                  { label: 'Last name', value: 'family-name' },
                  { label: 'Email', value: 'email' },
                  { label: 'Phone', value: 'tel' },
                  { label: 'Company / brand name', value: 'organization' },
                  { label: 'Job title', value: 'organization-title' },
                  { label: 'Website', value: 'url' },
                  { label: 'Street address', value: 'street-address' },
                  { label: 'City', value: 'address-level2' },
                  { label: 'State / region', value: 'address-level1' },
                  { label: 'Postal code', value: 'postal-code' },
                  { label: 'Country', value: 'country-name' },
                ],
                admin: {
                  description:
                    'Lets the browser offer the visitor’s saved details for this field. Leave empty on B2B fields where a personal value would be wrong — a company field should use “Company / brand name”, never “Full name”.',
                },
              })
            }

            // What a field *means*, chosen explicitly rather than guessed from
            // its name. The previous heuristic (a regex over name and label)
            // missed anything an editor called "Cell" or "Número de contacto",
            // and a missed phone reaches Monday unnormalised — which is what
            // its phone column rejected in ffd890a.
            if (block.slug === 'text') {
              addOnce(block, {
                name: 'valueType',
                type: 'select',
                defaultValue: 'text',
                options: [
                  { label: 'Plain text', value: 'text' },
                  { label: 'Phone number', value: 'phone' },
                  { label: 'Website / URL', value: 'website' },
                ],
                admin: {
                  description:
                    'Phone strips formatting before the value is sent on (Monday phone columns require it). Website accepts "acme.com" and adds the https:// people leave out.',
                },
              })
            }

            // Date or date+time, chosen per field. One block rather than two
            // types: it is the same control with or without the time part.
            if (block.slug === 'date') {
              addOnce(block, {
                name: 'granularity',
                type: 'select',
                defaultValue: 'date',
                options: [
                  { label: 'Date only', value: 'date' },
                  { label: 'Date and time', value: 'dateAndTime' },
                ],
                admin: {
                  description:
                    'Date and time also fills the time part of a Monday.com date column; date only leaves it empty.',
                },
              })
            }

            addOnce(block, {
              access: integrationFieldAccess,
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
            // The public heading. `title` stays the internal identifier — it is
            // what the admin list shows, what GA receives as `form_name`, and
            // what the Monday connected-forms panel links by, so localizing it
            // would split every one of those in two by locale. This is the one
            // the visitor reads, so it is the one that gets translated.
            // Optional with a fallback to `title`: an empty ES must not leave
            // the drawer headless.
            {
              name: 'displayTitle',
              type: 'text',
              localized: true,
              admin: {
                position: 'sidebar',
                description:
                  'Heading shown to the visitor above the form. Translate it per locale. Leave empty to fall back to the Title above, which is an internal name (admin list, analytics) and is not translated.',
              },
            },
            {
              access: integrationFieldAccess,
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
              access: integrationFieldAccess,
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
              access: integrationFieldAccess,
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
              // The root editor (defaultLexical) ships Bold/Italic/Underline/Link
              // as *features* but no toolbar to reach them, so the link drawer was
              // unreachable here — selecting text and trying to link it silently
              // dropped the selection instead. Bold/Italic have keyboard shortcuts;
              // Link has none, and this is the one field whose whole job is to
              // carry a privacy-policy link.
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
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
              '@/collections/FormSubmissions/components/ViewAttachmentsButton#ViewAttachmentsButton',
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
          // The Monday item this submission became. Without it there is no way
          // to get from a lead in /admin to the item the sales team works from,
          // and a re-sync cannot tell "never synced" from "already an item" —
          // it just creates a second one.
          name: 'externalItemId',
          type: 'text',
          label: 'Monday.com item id',
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
          // Form attachments go to the private R2 bucket, not the public
          // `media` collection: a placement application can carry a lease, an
          // invoice or a floor plan, and `media` is world-readable and about
          // to be served straight off R2's public URL. Same model as
          // Claims.photoKey — the durable reference is an object key, and a
          // presigned URL is minted on demand for staff who need to look.
          name: 'attachments',
          type: 'array',
          admin: {
            readOnly: true,
            description:
              'Files submitted with this form. Stored in the private bucket — use the View button above, the key alone is not a URL.',
          },
          fields: [
            { name: 'field', type: 'text' },
            { name: 'key', type: 'text' },
            { name: 'filename', type: 'text' },
            { name: 'mimeType', type: 'text' },
          ],
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
      // No afterChange sync hook here on purpose: the Monday dispatch runs
      // after the submission is committed, from /next/form-submissions (see
      // syncFormSubmission's own comment). As an afterChange it shared the
      // create's transaction and could roll the visitor's lead back.
      endpoints: [resyncEndpoint, attachmentUrlEndpoint],
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

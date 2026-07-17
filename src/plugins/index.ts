import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { Insight, Machine, Page, Project } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { getServerSideURL } from '@/utilities/getURL'

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
      pages: { enabled: { find: true } },
      insights: { enabled: { find: true } },
      media: { enabled: { find: true } },
      categories: { enabled: { find: true } },
      partners: { enabled: { find: true } },
      projects: { enabled: { find: true } },
      faqItems: { enabled: { find: true } },
      machines: { enabled: { find: true, create: true, update: true, delete: true } },
    },
  }),
  importExportPlugin({
    collections: [
      { slug: 'pages' },
      { slug: 'insights' },
      { slug: 'media' },
      { slug: 'categories' },
      { slug: 'brands' },
      { slug: 'claims' },
      { slug: 'forms' },
    ],
  }),
  // Use Cloudflare R2 (S3-compatible) when credentials are set.
  // Locally, Payload falls back to the staticDir in Media.ts (/public/media).
  ...(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET,
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
  redirectsPlugin({
    collections: ['pages', 'insights'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      admin: {
        group: 'Config',
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
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
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
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
      },
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

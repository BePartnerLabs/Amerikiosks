import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { APIError, type CollectionConfig } from 'payload'

// SVG is deliberately absent: it executes when served, sanitising it properly is
// a project of its own, and nothing here needs editor-uploaded SVG — icons and
// the logo ship as components out of `public/logos`.
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    defaultColumns: ['filename', 'updatedAt'],
    useAsTitle: 'filename',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    // Second gate for the client-upload path described under `mimeTypes`. The
    // object is already in the bucket by the time this runs — the browser PUT
    // happens first — so this cannot unsay the upload. What it does is stop the
    // file from becoming a Media document: nothing in the CMS can reference it,
    // it never reaches the site, and the attempt is visible as a failed create.
    beforeValidate: [
      ({ data, req }) => {
        const mimeType = data?.mimeType ?? req.file?.mimetype
        if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
          throw new APIError(
            `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}.`,
            400,
          )
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Media is served straight off the public CDN host with
    // `disablePayloadAccessControl`, so whatever lands here is fetched from our
    // own origin with no gate in front of it. An SVG or an HTML file therefore
    // *executes* on that domain — an editor account (or a stolen one) becomes
    // stored XSS on the site's own hostname. Raster and video only; SVG is
    // deliberately excluded, since sanitising it properly is a project of its
    // own and nothing on the site needs editor-uploaded SVG (icons and the logo
    // ship as components).
    // Only enforced on the server-transiting upload path, and this project does
    // not use it: `clientUploads: true` (see s3Storage in src/plugins/index.ts)
    // has the browser PUT straight to R2 through a presigned URL whose handler
    // checks `!!req.user` and file size and nothing else — its `access` hook is
    // called with `{ collectionSlug, req }` and never sees the mime type, so
    // there is no seam to validate in. Kept because it still drives the admin
    // file picker's `accept` filter and covers local/dev uploads, and paired
    // with the beforeValidate hook below so a disallowed type at least cannot
    // become a referenceable document. Closing it properly is an R2-side job
    // (content-type policy or `Content-Disposition: attachment` on the bucket)
    // — tracked in the roadmap, not fixable from this repo.
    mimeTypes: ALLOWED_MIME_TYPES,
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}

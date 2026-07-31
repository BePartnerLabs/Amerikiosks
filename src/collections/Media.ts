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
  // Straight off a phone. HEIC/HEIF is what an iPhone produces by default, and
  // an editor uploading a photo they just took is the most ordinary thing this
  // collection will ever be asked to do — leaving it out would have turned a
  // security tweak into "the CMS rejects my pictures".
  'image/heic',
  'image/heif',
  'image/tiff',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
]

import { mediaAdminThumbnail } from '@/utilities/mediaAdminThumbnail'
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
    // A function, not the string 'thumbnail'. The string form makes Payload
    // build a *relative* `/api/media/file/<name>-300x105.png`, and that route
    // is dead here: `disablePayloadAccessControl: true` (see s3Storage in
    // src/plugins/index.ts) turns off the handler that would serve it from R2,
    // so the request falls through to the default one, which reads from
    // `staticDir` — a directory that does not exist on Vercel. Every request
    // 500'd with "missing on the disk. Expected path: /var/task/public/media/…"
    // while the file sat in R2 perfectly intact.
    //
    // It looked like it only affected *some* images, which is what made it hard
    // to place: the 74 docs that have a generated `thumbnail` size were all
    // broken, and the 19 without one (SVG, MP4, PSD, AI, and anything narrower
    // than 300px, which Sharp will not upscale) kept working, because a null
    // thumbnailURL makes the admin fall back to `url` — already a CDN address.
    // So the ones that rendered were the odd ones out.
    //
    // Returning the size's own `url` hands the admin the absolute CDN address,
    // the same one the frontend already uses. The `url` fallback keeps those 19
    // behaving exactly as they do today.
    adminThumbnail: ({ doc }) => mediaAdminThumbnail(doc),
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

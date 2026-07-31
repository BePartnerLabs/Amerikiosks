import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

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

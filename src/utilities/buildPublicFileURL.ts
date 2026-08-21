import { posix } from 'node:path'

/**
 * Public URL for a stored media file, on the bucket's own host.
 *
 * The R2 custom domain is path-style (`https://cdn.amerikiosks.com/<bucket>/
 * <key>`), so the bucket is always part of the path. Only the last segment is
 * encoded,
 * matching what @payloadcms/storage-s3 does internally; several files in the
 * bucket have spaces and non-ASCII whitespace in their names.
 *
 * Lives here rather than in plugins/index.ts because Media's adminThumbnail
 * needs it too: that hook receives the document *before* the storage plugin
 * rewrites its urls, so it has to build the address itself instead of reading
 * one off the doc.
 */
export const buildPublicFileURL = (filename: string, prefix?: string): string => {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, '')
  const key = [prefix, filename].filter(Boolean).join('/')
  const dir = posix.dirname(key)
  const encoded = encodeURIComponent(posix.basename(key))

  return [base, process.env.S3_BUCKET, dir === '.' ? encoded : posix.join(dir, encoded)]
    .filter(Boolean)
    .join('/')
}

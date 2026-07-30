/**
 * Processes media resource URL to ensure proper formatting.
 *
 * With `disablePayloadAccessControl` on the s3Storage adapter (see
 * `src/plugins/index.ts`), stored media is absolute and points at
 * `S3_PUBLIC_URL`, so the cache tag applies to it — the bucket host ignores
 * the query param and Next.js folds it into the image cache key.
 *
 * Relative paths still reach here from media that predates that setup or is
 * served off `/public` (e.g. `/claim-form/...`). Those are left untouched:
 * Payload's own file endpoint returns 400 on query params, and Next.js
 * handles caching for local paths internally.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const isExternal = url.startsWith('http://') || url.startsWith('https://')
  if (isExternal && cacheTag && cacheTag !== '') {
    return `${url}?v=${encodeURIComponent(cacheTag)}`
  }

  return url
}

/**
 * Processes media resource URL to ensure proper formatting.
 *
 * Local paths (e.g. `/api/media/file/image.webp`) are kept relative so
 * Next.js image optimization treats them as local rather than fetching
 * through `remotePatterns`, which blocks private IPs since Next.js 16.
 *
 * Cache tags are only appended to external URLs — Payload's local file
 * endpoint does not accept query parameters and returns 400 when they
 * are present. Next.js Image handles caching for local paths internally.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const isExternal = url.startsWith('http://') || url.startsWith('https://')
  if (isExternal && cacheTag && cacheTag !== '') {
    return `${url}?v=${encodeURIComponent(cacheTag)}`
  }

  return url
}

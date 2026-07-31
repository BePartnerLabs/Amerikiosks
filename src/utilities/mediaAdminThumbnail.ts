import { buildPublicFileURL } from '@/utilities/buildPublicFileURL'

/**
 * The image the admin list and upload field show for a Media document.
 *
 * It builds the bucket URL itself rather than reading `sizes.thumbnail.url` off
 * the document, because Payload runs `adminThumbnail` against `originalDoc` —
 * the row as stored, *before* the storage plugin's afterRead hook rewrites
 * every url onto the CDN host. Reading the doc's own url there yields Payload's
 * internal `/api/media/file/…` path, which is exactly the broken value this
 * replaces.
 */
export function mediaAdminThumbnail(doc: unknown): string | null {
  if (!doc || typeof doc !== 'object') return null
  const media = doc as {
    filename?: unknown
    prefix?: unknown
    sizes?: { thumbnail?: { filename?: unknown } }
  }

  const prefix = typeof media.prefix === 'string' ? media.prefix : undefined
  const thumbnail = media.sizes?.thumbnail?.filename

  if (typeof thumbnail === 'string' && thumbnail) return buildPublicFileURL(thumbnail, prefix)

  // No thumbnail size: SVG, video, PSD/AI, or an image narrower than 300px,
  // which Sharp will not upscale. The original is the best preview available.
  if (typeof media.filename === 'string' && media.filename) {
    return buildPublicFileURL(media.filename, prefix)
  }

  return null
}

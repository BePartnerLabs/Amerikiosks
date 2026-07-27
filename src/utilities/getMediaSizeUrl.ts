import type { Media } from '@/payload-types'

// Payload's upload.imageSizes (src/collections/Media.ts), ascending by width —
// keep in sync if that list changes. `og` is excluded: it's a fixed 1200×630
// crop for social cards, not a general-purpose responsive size.
const SIZE_ORDER = ['thumbnail', 'square', 'small', 'medium', 'large', 'xlarge'] as const

/**
 * Picks the smallest Payload-generated image size whose width covers
 * `targetWidth`, falling back to the next size up, then the original.
 *
 * Every image in this app is fed to `next/image`, which already resizes,
 * re-encodes, and caches on demand from whatever `src` it's given — but it
 * still has to fetch that `src` from origin every time its cache misses.
 * Payload generates 7 fixed-width derivatives at upload time (see
 * `src/collections/Media.ts`); using the smallest one that's still big
 * enough for how the image actually renders means Next's optimizer starts
 * from a source that's already close to the target size instead of a
 * multi-MB original, cutting both origin bandwidth and resize CPU cost.
 *
 * `targetWidth` should be the largest CSS width (in px) the image will ever
 * render at for this usage — not the viewport width. For a `fill` image
 * inside a 23rem-wide carousel card, that's ~368, not 1920.
 */
export function getBestMediaUrl(
  media: Media | null | undefined,
  targetWidth: number,
): string | null | undefined {
  if (!media) return undefined

  for (const key of SIZE_ORDER) {
    const size = media.sizes?.[key]
    if (size?.url && size.width && size.width >= targetWidth) {
      return size.url
    }
  }

  // No generated size is wide enough (or sizes weren't populated) — the
  // original is the only option left, whatever its size.
  return media.url
}

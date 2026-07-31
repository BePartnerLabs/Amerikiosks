import { describe, expect, it } from 'vitest'
import { Media } from '@/collections/Media'
import { DEFAULT_MEDIA_MIME_TYPES, resolveMediaMimeTypes } from '@/utilities/mediaMimeTypes'

describe('media mime types', () => {
  // Five partner logos in production are SVG (Hilton, Royal Caribbean,
  // SeaWorld, YumPal, Nekodrop). A brand logo arriving as a vector is the
  // normal case, so blocking it would break a workflow the client uses — and
  // would not remove the risk, since those five are already being served.
  it('allows svg by default', () => {
    expect(DEFAULT_MEDIA_MIME_TYPES).toContain('image/svg+xml')
  })

  // The hero videos in production are mp4; quicktime covers a .mov straight
  // off a phone. Replacing the home hero video must not fail.
  it.each(['video/mp4', 'video/webm', 'video/quicktime'])('allows %s', (type) => {
    expect(DEFAULT_MEDIA_MIME_TYPES).toContain(type)
  })

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])(
    'allows %s',
    (type) => {
      expect(DEFAULT_MEDIA_MIME_TYPES).toContain(type)
    },
  )

  // What the list is actually for, now that SVG is in it.
  it.each(['text/html', 'application/javascript', 'application/x-msdownload'])(
    'excludes %s',
    (type) => {
      expect(DEFAULT_MEDIA_MIME_TYPES).not.toContain(type)
    },
  )

  it('is what the collection uses', () => {
    expect((Media.upload as { mimeTypes?: string[] }).mimeTypes).toEqual(DEFAULT_MEDIA_MIME_TYPES)
  })
})

describe('SUPPORTED_MEDIA_TYPES override', () => {
  it('replaces the defaults when set', () => {
    expect(resolveMediaMimeTypes('image/png,image/jpeg')).toEqual(['image/png', 'image/jpeg'])
  })

  // The point of the override: drop SVG from Vercel without shipping code.
  it('can be used to drop svg', () => {
    const without = DEFAULT_MEDIA_MIME_TYPES.filter((t) => t !== 'image/svg+xml')
    expect(resolveMediaMimeTypes(without.join(','))).not.toContain('image/svg+xml')
  })

  it('tolerates spacing and casing', () => {
    expect(resolveMediaMimeTypes(' IMAGE/PNG , image/jpeg ')).toEqual(['image/png', 'image/jpeg'])
  })

  // An empty value is a mistake, not an instruction to accept nothing — an
  // allowlist of zero types would reject every upload in the CMS.
  it.each(['', '   ', ',,'])('falls back to the defaults for %o', (raw) => {
    expect(resolveMediaMimeTypes(raw)).toEqual(DEFAULT_MEDIA_MIME_TYPES)
  })

  it('falls back when unset', () => {
    expect(resolveMediaMimeTypes(undefined)).toEqual(DEFAULT_MEDIA_MIME_TYPES)
  })
})

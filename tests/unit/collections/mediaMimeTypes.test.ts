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

// The hook is the only gate that runs on the path this project actually uses:
// with `clientUploads: true` the browser PUTs straight to R2 through a presigned
// URL whose handler never sees the mime type, so `mimeTypes` alone is close to a
// no-op in production. It cannot unsay the upload — the object is in the bucket
// by the time this runs — but it stops the file from becoming a document, which
// is what keeps it out of the CMS and off the site.
describe('Media beforeValidate gate', () => {
  const hook = (Media.hooks?.beforeValidate ?? [])[0] as (args: {
    data?: Record<string, unknown>
    req: { file?: { mimetype?: string } }
  }) => unknown

  const run = (mimeType?: string, fromReqFile = false) =>
    hook({
      data: fromReqFile ? {} : { mimeType },
      req: fromReqFile ? { file: { mimetype: mimeType } } : {},
    })

  it('is wired up', () => {
    expect(typeof hook).toBe('function')
  })

  it.each(['image/jpeg', 'image/png', 'image/svg+xml', 'image/heic', 'video/mp4'])(
    'lets %s through',
    (type) => {
      expect(() => run(type)).not.toThrow()
    },
  )

  it.each(['text/html', 'application/javascript', 'application/x-msdownload'])(
    'rejects %s',
    (type) => {
      expect(() => run(type)).toThrow(/Unsupported file type/)
    },
  )

  // Payload puts the type on `req.file` for a server-transiting upload and on
  // `data` for a client upload. Missing either one would leave a real path
  // unchecked.
  it('reads the type from req.file when data does not carry it', () => {
    expect(() => run('text/html', true)).toThrow(/Unsupported file type/)
    expect(() => run('image/png', true)).not.toThrow()
  })

  // Every update to an existing document runs beforeValidate too — editing the
  // alt text of a picture must not be rejected for lack of a mime type.
  it('allows a document with no mime type at all', () => {
    expect(() => hook({ data: { alt: 'a caption' }, req: {} })).not.toThrow()
  })

  it('names the offending type and the allowed ones in the error', () => {
    expect(() => run('application/zip')).toThrow(/application\/zip/)
    expect(() => run('application/zip')).toThrow(/image\/jpeg/)
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

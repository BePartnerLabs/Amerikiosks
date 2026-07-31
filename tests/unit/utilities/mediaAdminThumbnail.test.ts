import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mediaAdminThumbnail } from '@/utilities/mediaAdminThumbnail'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.S3_PUBLIC_URL = 'https://cdn.amerikiosks.com'
  process.env.S3_BUCKET = 'website-8h349ieouv'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

// The bug: `adminThumbnail: 'thumbnail'` produced a relative
// /api/media/file/<name>-300x105.png, and that route 500s in production —
// `disablePayloadAccessControl` turns off the handler that would serve it from
// R2, so it falls through to the default one, which reads from a staticDir that
// does not exist on Vercel ("missing on the disk. Expected path:
// /var/task/public/media/…") while the file sits in the bucket untouched.
describe('mediaAdminThumbnail', () => {
  it('builds the bucket url for the generated thumbnail size', () => {
    expect(
      mediaAdminThumbnail({
        filename: 'shark.png',
        sizes: { thumbnail: { filename: 'shark-300x105.png' } },
      }),
    ).toBe('https://cdn.amerikiosks.com/website-8h349ieouv/shark-300x105.png')
  })

  // SVG, video, PSD/AI and anything narrower than 300px get no thumbnail size
  // (Sharp does not upscale). These are the documents that kept rendering while
  // the rest broke, and they must keep rendering.
  it('falls back to the original file when no thumbnail size exists', () => {
    expect(mediaAdminThumbnail({ filename: 'logo.svg', sizes: {} })).toBe(
      'https://cdn.amerikiosks.com/website-8h349ieouv/logo.svg',
    )
  })

  // Several files in the bucket have spaces and non-ASCII whitespace in their
  // names — the one that surfaced this bug was
  // "The Shark World_ Tagline_Unwrap_Navy (1)-300x105.png".
  it('encodes the filename, so names with spaces resolve', () => {
    expect(
      mediaAdminThumbnail({
        filename: 'The Shark World (1).png',
        sizes: { thumbnail: { filename: 'The Shark World (1)-300x105.png' } },
      }),
    ).toBe('https://cdn.amerikiosks.com/website-8h349ieouv/The%20Shark%20World%20(1)-300x105.png')
  })

  it('keeps a document prefix in the key', () => {
    expect(
      mediaAdminThumbnail({
        filename: 'a.png',
        prefix: 'folder',
        sizes: { thumbnail: { filename: 'a-300x300.png' } },
      }),
    ).toBe('https://cdn.amerikiosks.com/website-8h349ieouv/folder/a-300x300.png')
  })

  // Payload calls this for every row, including ones mid-upload.
  it('returns null rather than throwing when there is nothing to show', () => {
    expect(mediaAdminThumbnail({})).toBeNull()
    expect(mediaAdminThumbnail(null)).toBeNull()
  })

  it('never returns a relative /api/media/file path', () => {
    const result = mediaAdminThumbnail({
      filename: 'x.png',
      sizes: { thumbnail: { filename: 'x-300x300.png' } },
    })
    expect(result?.startsWith('/api/')).toBe(false)
  })
})

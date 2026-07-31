import { describe, expect, it } from 'vitest'
import { Media } from '@/collections/Media'

const upload = Media.upload as { mimeTypes?: string[] }
const allowed = upload.mimeTypes ?? []

describe('Media upload allowlist', () => {
  // SVG executes when served, and media is served off the public CDN host with
  // access control disabled. Sanitising it properly is a project of its own and
  // nothing here needs editor-uploaded SVG — icons and the logo are components.
  it('excludes svg', () => {
    expect(allowed).not.toContain('image/svg+xml')
  })

  // The formats a real editor actually has on hand. HEIC is what an iPhone
  // produces by default; leaving it out turns a security tweak into "the CMS
  // rejects my photos".
  it.each([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/tiff',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
  ])('accepts %s', (type) => {
    expect(allowed).toContain(type)
  })

  it('rejects executable and markup types', () => {
    for (const type of ['text/html', 'application/javascript', 'application/x-msdownload']) {
      expect(allowed).not.toContain(type)
    }
  })
})

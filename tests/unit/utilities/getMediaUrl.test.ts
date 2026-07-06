import { describe, expect, it } from 'vitest'
import { getMediaUrl } from '@/utilities/getMediaUrl'

describe('getMediaUrl', () => {
  it('returns an empty string when the url is null or undefined', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl(undefined)).toBe('')
  })

  it('returns local paths unmodified even when a cache tag is provided', () => {
    expect(getMediaUrl('/api/media/file/image.webp', 'abc123')).toBe('/api/media/file/image.webp')
  })

  it('appends the cache tag as a query param for external urls', () => {
    expect(getMediaUrl('https://cdn.example.com/image.webp', 'abc123')).toBe(
      'https://cdn.example.com/image.webp?v=abc123',
    )
  })

  it('returns external urls unmodified when no cache tag is provided', () => {
    expect(getMediaUrl('http://cdn.example.com/image.webp')).toBe(
      'http://cdn.example.com/image.webp',
    )
  })

  it('returns external urls unmodified when the cache tag is an empty string', () => {
    expect(getMediaUrl('https://cdn.example.com/image.webp', '')).toBe(
      'https://cdn.example.com/image.webp',
    )
  })
})

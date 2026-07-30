import { describe, expect, it } from 'vitest'
import { absoluteUrl } from '@/utilities/absoluteUrl'

describe('absoluteUrl', () => {
  it('keeps already-absolute URLs untouched', () => {
    expect(absoluteUrl('https://cdn.example.com/b/k.png', 'https://site.com')).toBe(
      'https://cdn.example.com/b/k.png',
    )
  })

  it('prefixes relative paths with the server URL', () => {
    expect(absoluteUrl('/media/k.png', 'https://site.com')).toBe('https://site.com/media/k.png')
  })
})

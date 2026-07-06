import { describe, expect, it } from 'vitest'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

describe('mergeOpenGraph', () => {
  it('returns the defaults when called with no argument', () => {
    const result = mergeOpenGraph()
    expect(result?.siteName).toBe('Amerikiosks')
    expect(result?.title).toBe('Amerikiosks')
    expect(result).toMatchObject({ type: 'website' })
    expect(result?.images).toBeDefined()
  })

  it('overrides individual default fields', () => {
    const result = mergeOpenGraph({ title: 'Custom Title' })
    expect(result?.title).toBe('Custom Title')
    expect(result?.siteName).toBe('Amerikiosks')
  })

  it('uses the provided images instead of the default when given', () => {
    const customImages = [{ url: 'https://example.com/custom.jpg' }]
    const result = mergeOpenGraph({ images: customImages })
    expect(result?.images).toBe(customImages)
  })

  it('falls back to the default images when none are provided', () => {
    const result = mergeOpenGraph({ title: 'No images here' })
    expect(result?.images).toBeDefined()
    expect(Array.isArray(result?.images)).toBe(true)
  })
})

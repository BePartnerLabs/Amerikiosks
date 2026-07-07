import { describe, expect, it } from 'vitest'
import { generateTitle, generateURL } from '@/plugins'

describe('generateTitle', () => {
  it('suffixes doc.title with the site name for title-based collections', () => {
    const result = generateTitle({ doc: { title: 'For Brands' } } as never)
    expect(result).toBe('For Brands | Amerikiosks')
  })

  it('falls back to doc.name for name-based collections (Machines)', () => {
    const result = generateTitle({ doc: { name: 'Gamma 13' } } as never)
    expect(result).toBe('Gamma 13 | Amerikiosks')
  })

  it('prefers doc.title over doc.name when both are present', () => {
    const result = generateTitle({ doc: { title: 'Title Wins', name: 'Name Loses' } } as never)
    expect(result).toBe('Title Wins | Amerikiosks')
  })

  it('falls back to the bare site name when neither title nor name is set', () => {
    const result = generateTitle({ doc: {} } as never)
    expect(result).toBe('Amerikiosks')
  })
})

describe('generateURL', () => {
  it('builds an absolute url from the server url and slug', () => {
    const result = generateURL({ doc: { slug: 'for-brands' } } as never)
    expect(result).toContain('/for-brands')
  })

  it('returns the bare server url when slug is missing', () => {
    const result = generateURL({ doc: {} } as never)
    expect(result).not.toContain('undefined')
  })
})

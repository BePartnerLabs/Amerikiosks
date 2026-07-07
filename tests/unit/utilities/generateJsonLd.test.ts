import { describe, expect, it } from 'vitest'
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from '@/utilities/generateJsonLd'

describe('generateOrganizationJsonLd', () => {
  it('builds the minimal Organization schema without optional fields', () => {
    const result = generateOrganizationJsonLd({ serverUrl: 'https://amerikiosks.com' })
    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Amerikiosks',
      url: 'https://amerikiosks.com',
      logo: 'https://amerikiosks.com/logos/logo-1.svg',
    })
  })

  it('includes description when brandDescription is provided', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      brandDescription: 'Retail automation infrastructure.',
    })
    expect(result.description).toBe('Retail automation infrastructure.')
  })

  it('omits description when brandDescription is null or empty', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      brandDescription: null,
    })
    expect(result).not.toHaveProperty('description')
  })

  it('includes a ContactPoint when contactEmail is provided', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      contactEmail: 'hello@amerikiosks.com',
    })
    expect(result.contactPoint).toEqual({
      '@type': 'ContactPoint',
      email: 'hello@amerikiosks.com',
      contactType: 'sales',
    })
  })

  it('omits contactPoint when contactEmail is null or empty', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      contactEmail: null,
    })
    expect(result).not.toHaveProperty('contactPoint')
  })
})

describe('generateWebsiteJsonLd', () => {
  it('builds the WebSite schema with a SearchAction pointing at /search', () => {
    const result = generateWebsiteJsonLd({ serverUrl: 'https://amerikiosks.com' })
    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Amerikiosks',
      url: 'https://amerikiosks.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://amerikiosks.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    })
  })
})

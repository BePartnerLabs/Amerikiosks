import { describe, expect, it } from 'vitest'
import {
  generateArticleJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from '@/utilities/generateJsonLd'

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

  it('reports social profiles as sameAs', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      socialUrls: ['https://www.instagram.com/amerikiosks', 'https://www.linkedin.com/company/ak'],
    })
    expect(result).toHaveProperty('sameAs', [
      'https://www.instagram.com/amerikiosks',
      'https://www.linkedin.com/company/ak',
    ])
  })

  it('omits sameAs when no profile has a url', () => {
    const result = generateOrganizationJsonLd({
      serverUrl: 'https://amerikiosks.com',
      socialUrls: [null, undefined, ''],
    })
    expect(result).not.toHaveProperty('sameAs')
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

describe('generateArticleJsonLd', () => {
  const base = {
    serverUrl: 'https://www.amerikiosks.com',
    url: 'https://www.amerikiosks.com/insights/x',
  }

  it('emits an Article with the publisher attached', () => {
    const ld = generateArticleJsonLd({ ...base, headline: 'What end-to-end operation includes' })
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('What end-to-end operation includes')
    expect(ld.publisher).toMatchObject({ '@type': 'Organization', name: 'Amerikiosks' })
    expect(ld.mainEntityOfPage).toMatchObject({ '@id': base.url })
  })

  // The reason this exists: an engine quoting the article needs someone to
  // attribute it to.
  it('maps authors to Person entries', () => {
    const ld = generateArticleJsonLd({ ...base, authors: ['Ada Lovelace', 'Grace Hopper'] })
    expect(ld.author).toEqual([
      { '@type': 'Person', name: 'Ada Lovelace' },
      { '@type': 'Person', name: 'Grace Hopper' },
    ])
  })

  it('drops empty author entries rather than emitting blanks', () => {
    const ld = generateArticleJsonLd({ ...base, authors: [null, '', undefined, 'Ada'] })
    expect(ld.author).toEqual([{ '@type': 'Person', name: 'Ada' }])
  })

  it('omits author entirely when there is nobody', () => {
    expect(generateArticleJsonLd({ ...base, authors: [] })).not.toHaveProperty('author')
  })

  // An article nobody edited was last modified when it went out. Saying nothing
  // loses the signal for no reason.
  it('falls back to the publication date for dateModified', () => {
    const ld = generateArticleJsonLd({ ...base, datePublished: '2026-07-01T00:00:00.000Z' })
    expect(ld.dateModified).toBe('2026-07-01T00:00:00.000Z')
  })

  it('prefers a real modification date when there is one', () => {
    const ld = generateArticleJsonLd({
      ...base,
      datePublished: '2026-07-01T00:00:00.000Z',
      dateModified: '2026-08-01T00:00:00.000Z',
    })
    expect(ld.dateModified).toBe('2026-08-01T00:00:00.000Z')
  })

  // Schema.org accepts a partial Article, and `author: undefined` or an empty
  // date is worse than an omission — a validator flags it and a consumer has to
  // special-case it.
  it('omits every field it was given nothing for', () => {
    const ld = generateArticleJsonLd(base)
    for (const key of [
      'headline',
      'description',
      'image',
      'datePublished',
      'dateModified',
      'author',
    ]) {
      expect(ld).not.toHaveProperty(key)
    }
    expect(ld['@type']).toBe('Article')
  })
})

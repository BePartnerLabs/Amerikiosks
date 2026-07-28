import { describe, expect, it } from 'vitest'
import { applyLocale, normalizePath } from '@/plugins/redirects/normalizePath'

describe('normalizePath', () => {
  it('leaves an already-canonical path alone', () => {
    expect(normalizePath('/our-history')).toEqual({ path: '/our-history', locale: null })
  })

  // Every case below is real data from the production redirects table that
  // silently never matched under the old `redirect.from === url` comparison.
  it.each([
    ['/cart/', '/cart'],
    ['/contact-old/london-office/', '/contact-old/london-office'],
    ['our-story', '/our-story'],
    ['/Our-History', '/our-history'],
    ['https://www.amerikiosks.com/shop/', '/shop'],
    ['/2023/02/hello-world/', '/2023/02/hello-world'],
    ['//double//slash//', '/double/slash'],
    ['/search?q=kiosk', '/search'],
    ['/page#section', '/page'],
    ['  /padded/  ', '/padded'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePath(input).path).toBe(expected)
  })

  it('keeps the root path as /', () => {
    expect(normalizePath('/').path).toBe('/')
    expect(normalizePath('').path).toBe('/')
  })

  it('strips a locale prefix and reports it', () => {
    expect(normalizePath('/es/tienda/')).toEqual({ path: '/tienda', locale: 'es' })
    expect(normalizePath('/en/shop')).toEqual({ path: '/shop', locale: 'en' })
  })

  it('does not mistake a slug that merely starts with a locale for a prefix', () => {
    expect(normalizePath('/essentials')).toEqual({ path: '/essentials', locale: null })
  })

  it('treats a bare locale as the root of that locale', () => {
    expect(normalizePath('/es')).toEqual({ path: '/', locale: 'es' })
  })
})

describe('applyLocale', () => {
  it('re-applies a non-default locale to a relative target', () => {
    expect(applyLocale('/contact', 'es')).toBe('/es/contact')
  })

  it('leaves the default locale unprefixed', () => {
    expect(applyLocale('/contact', 'en')).toBe('/contact')
    expect(applyLocale('/contact', null)).toBe('/contact')
  })

  it('leaves absolute targets untouched', () => {
    expect(applyLocale('https://example.com/x', 'es')).toBe('https://example.com/x')
  })

  it('does not double-prefix a target that already carries a locale', () => {
    expect(applyLocale('/es/contacto', 'es')).toBe('/es/contacto')
  })
})

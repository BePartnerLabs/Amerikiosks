import { describe, expect, it } from 'vitest'
import {
  languageAlternates,
  localizeHref,
  machinesAlternates,
  machinesPath,
  withLocale,
} from '@/utilities/localeUrl'

describe('withLocale', () => {
  it('leaves the default locale unprefixed (localePrefix: as-needed)', () => {
    expect(withLocale('/faq', 'en')).toBe('/faq')
  })

  it('prefixes non-default locales', () => {
    expect(withLocale('/faq', 'es')).toBe('/es/faq')
  })

  it('emits the bare locale for the root, not a trailing slash', () => {
    expect(withLocale('/', 'en')).toBe('/')
    expect(withLocale('/', 'es')).toBe('/es')
  })
})

describe('machinesPath', () => {
  it('translates the machines segment for es', () => {
    expect(machinesPath('en')).toBe('/machines')
    expect(machinesPath('es')).toBe('/es/maquinas')
  })

  it('appends family and model slugs untouched — those are not translated', () => {
    expect(machinesPath('en', 'zeta', 'zeta-2')).toBe('/machines/zeta/zeta-2')
    expect(machinesPath('es', 'zeta', 'zeta-2')).toBe('/es/maquinas/zeta/zeta-2')
  })
})

describe('hreflang maps', () => {
  it('languageAlternates covers every locale', () => {
    expect(languageAlternates('/faq')).toEqual({ en: '/faq', es: '/es/faq' })
  })

  it('machinesAlternates applies the localized segment', () => {
    expect(machinesAlternates('zeta')).toEqual({
      en: '/machines/zeta',
      es: '/es/maquinas/zeta',
    })
  })
})

describe('localizeHref', () => {
  // The bug: `localePrefix: 'as-needed'` makes an un-prefixed path resolve to
  // EN, and CMS slugs are translated per locale — so an ES link without the
  // prefix does not just land on the wrong language, it 404s.
  it('prefixes a CMS path when the locale is not the default', () => {
    expect(localizeHref('/politica-de-privacidad', 'es')).toBe('/es/politica-de-privacidad')
  })

  it('leaves the default locale un-prefixed', () => {
    expect(localizeHref('/privacy-policy', 'en')).toBe('/privacy-policy')
  })

  // An editor who typed the prefix by hand — which is the workaround people
  // were told to use while this was broken — must not end up at /es/es/...
  it('does not double-prefix an href that already carries a locale', () => {
    expect(localizeHref('/es/politica-de-privacidad', 'es')).toBe('/es/politica-de-privacidad')
    expect(localizeHref('/es/politica-de-privacidad', 'en')).toBe('/es/politica-de-privacidad')
  })

  it('leaves absolute urls and other schemes alone', () => {
    expect(localizeHref('https://example.com/x', 'es')).toBe('https://example.com/x')
    expect(localizeHref('//cdn.example.com/x', 'es')).toBe('//cdn.example.com/x')
    expect(localizeHref('mailto:hola@example.com', 'es')).toBe('mailto:hola@example.com')
    expect(localizeHref('tel:+15550100', 'es')).toBe('tel:+15550100')
  })

  it('leaves fragments and query-only hrefs on the current page', () => {
    expect(localizeHref('#section', 'es')).toBe('#section')
    expect(localizeHref('?page=2', 'es')).toBe('?page=2')
  })

  it('leaves relative hrefs and empty values alone', () => {
    expect(localizeHref('contact', 'es')).toBe('contact')
    expect(localizeHref('', 'es')).toBe('')
  })

  it('handles the site root without producing a trailing slash', () => {
    expect(localizeHref('/', 'es')).toBe('/es')
  })
})

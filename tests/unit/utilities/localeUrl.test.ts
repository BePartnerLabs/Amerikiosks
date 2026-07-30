import { describe, expect, it } from 'vitest'
import {
  languageAlternates,
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

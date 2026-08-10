import { describe, expect, it } from 'vitest'
import { routing } from '@/i18n/routing'

describe('routing', () => {
  it('supports en and es locales with en as default', () => {
    expect(routing.locales).toEqual(['en', 'es'])
    expect(routing.defaultLocale).toBe('en')
  })

  it('disables cookie/Accept-Language based locale detection', () => {
    expect(routing.localeDetection).toBe(false)
  })

  it('maps localized pathnames for the machines children', () => {
    expect(routing.pathnames?.['/machines/[family]']).toEqual({
      en: '/machines/[family]',
      es: '/maquinas/[family]',
    })
  })

  // El listado es un documento de `pages` con slug `machines`/`maquinas`. Si
  // volviera a este mapa, next-intl reescribiría `/maquinas` -> `/machines`
  // antes de que el catch-all `/[slug]` lo viera y el documento en español no
  // resolvería: 404 solo en español, sin error de build que lo delate.
  it('does not map the machines listing, which is a CMS page', () => {
    expect(routing.pathnames).not.toHaveProperty('/machines')
  })
})

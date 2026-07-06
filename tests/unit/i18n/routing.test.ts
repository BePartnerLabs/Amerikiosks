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

  it('maps localized pathnames for /machines', () => {
    expect(routing.pathnames?.['/machines']).toEqual({ en: '/machines', es: '/maquinas' })
  })
})

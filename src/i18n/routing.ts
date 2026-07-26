import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Bare paths (no /es prefix) must always resolve to 'en', regardless of the
  // NEXT_LOCALE cookie or Accept-Language — per-locale slugs differ (e.g.
  // travel-and-transit vs viajes-y-transito), so cookie-based locale detection
  // can redirect an EN bare path to /es/<EN-slug>, which 404s.
  localeDetection: false,
  pathnames: {
    '/machines': { en: '/machines', es: '/maquinas' },
    '/machines/[family]': { en: '/machines/[family]', es: '/maquinas/[family]' },
    '/machines/[family]/[slug]': {
      en: '/machines/[family]/[slug]',
      es: '/maquinas/[family]/[slug]',
    },
  },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

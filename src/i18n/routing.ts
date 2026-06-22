import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  pathnames: {
    '/machines': { en: '/machines', es: '/maquinas' },
    '/machines/[slug]': { en: '/machines/[slug]', es: '/maquinas/[slug]' },
  },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

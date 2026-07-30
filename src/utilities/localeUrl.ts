import { routing } from '@/i18n/routing'

export type AppLocale = (typeof routing.locales)[number]

/**
 * Path with the locale segment prepended, honoring `localePrefix: 'as-needed'`
 * (see `src/i18n/routing.ts`): the default locale has no prefix.
 *
 * Use for canonical/hreflang URLs in `generateMetadata`, where next-intl's
 * `Link`/`getPathname` aren't available.
 */
export const withLocale = (path: string, locale: AppLocale): string => {
  if (locale === routing.defaultLocale) return path
  // `/` would otherwise produce `/es/`, and a canonical that differs from the
  // URL the site actually serves defeats the point of emitting one.
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/**
 * `/machines` is the only route family whose path segment is localized
 * (`routing.pathnames`: `/machines` → `/maquinas`). The `[family]` and `[slug]`
 * params are NOT translated — the language switcher reuses the same params
 * across locales — so a machines URL can be built for either locale without
 * looking anything up.
 */
const machinesSegment: Record<AppLocale, string> = { en: 'machines', es: 'maquinas' }

export const machinesPath = (locale: AppLocale, ...segments: string[]): string =>
  withLocale(`/${[machinesSegment[locale], ...segments].join('/')}`, locale)

/**
 * hreflang map for a route whose path is the same in both locales apart from
 * the prefix (e.g. `/faq`). Not usable for CMS-driven routes whose slug differs
 * per locale (pages, insights, projects) — those need a per-locale slug lookup.
 */
export const languageAlternates = (path: string): Record<AppLocale, string> =>
  Object.fromEntries(routing.locales.map((l) => [l, withLocale(path, l)])) as Record<
    AppLocale,
    string
  >

/** hreflang map for a machines route, applying the localized `/maquinas` segment. */
export const machinesAlternates = (...segments: string[]): Record<AppLocale, string> =>
  Object.fromEntries(routing.locales.map((l) => [l, machinesPath(l, ...segments)])) as Record<
    AppLocale,
    string
  >

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
 * Prefix a CMS-authored href with the current locale, leaving alone anything
 * that must not be touched.
 *
 * `localePrefix: 'as-needed'` means an un-prefixed path always resolves to the
 * default locale (`en`). Every link built from CMS data — CMSLink, Card,
 * Pagination, RichText's internal links — was emitting exactly that, so a link
 * clicked from an `/es` page landed on the EN route. Where slugs are translated
 * (pages, insights, projects) the EN route does not have that slug, so it 404s
 * outright; the live consent text was linking Spanish visitors to a dead
 * privacy policy this way.
 *
 * Left untouched:
 * - absolute URLs and non-http schemes (`mailto:`, `tel:`), which are not ours
 * - fragments and query-only hrefs, which stay on the current page
 * - anything already carrying a locale prefix, so an editor who typed
 *   `/es/politica-de-privacidad` by hand does not end up at `/es/es/...`
 */
export const localizeHref = (href: string, locale: AppLocale): string => {
  if (!href) return href
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return href
  if (href.startsWith('#') || href.startsWith('?')) return href
  if (!href.startsWith('/')) return href

  const [first] = href.slice(1).split('/')
  if ((routing.locales as readonly string[]).includes(first)) return href

  return withLocale(href, locale)
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

import { routing } from '@/i18n/routing'

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`, 'i')

export type NormalizedPath = {
  /** Locale-free, slash-normalized path used as the lookup key. */
  path: string
  /** Locale stripped off the front, if any — re-applied to relative targets. */
  locale: string | null
}

/**
 * Turns anything an editor might paste into the `from` field — or anything a
 * browser might request — into one canonical lookup key.
 *
 * The old implementation compared `redirect.from === url` verbatim, so a
 * trailing slash, a locale prefix, a full URL or a capital letter meant the
 * redirect silently never fired. Every one of those showed up in real data.
 */
export const normalizePath = (input: string): NormalizedPath => {
  let path = (input ?? '').trim()
  if (!path) return { path: '/', locale: null }

  // Full URL pasted from the browser bar — keep only the path.
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname
    } catch {
      // Malformed URL: fall through and treat it as a path.
    }
  }

  // Drop query string and hash — redirects match on the path alone.
  path = path.split(/[?#]/)[0]

  if (!path.startsWith('/')) path = `/${path}`

  path = path.toLowerCase()

  let locale: string | null = null
  const localeMatch = path.match(LOCALE_PREFIX)
  if (localeMatch) {
    locale = localeMatch[1].toLowerCase()
    path = path.slice(localeMatch[0].length) || '/'
  }

  // Collapse duplicate slashes, then drop the trailing one (except for root).
  path = path.replace(/\/{2,}/g, '/')
  if (path.length > 1) path = path.replace(/\/+$/, '')

  return { path, locale }
}

/**
 * Re-applies the locale the request came in with to a site-relative target, so
 * an `/es` visitor stays in Spanish. Absolute targets are left untouched.
 */
export const applyLocale = (target: string, locale: string | null): string => {
  if (!locale || locale === routing.defaultLocale) return target
  if (!target.startsWith('/')) return target
  if (LOCALE_PREFIX.test(target)) return target
  return `/${locale}${target === '/' ? '' : target}`
}

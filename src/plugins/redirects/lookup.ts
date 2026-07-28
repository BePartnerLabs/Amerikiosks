import { applyLocale, normalizePath } from './normalizePath'
import type { RedirectEntry } from './types'

type Cache = { map: Map<string, RedirectEntry>; at: number }

let cache: Cache | null = null

/** Long enough that steady traffic costs ~1 fetch/minute, short enough that an
 *  editor sees their change without waiting. */
const TTL_MS = 60_000

/** Never let a slow/broken lookup hold up a page request. */
const TIMEOUT_MS = 2_000

export const __resetRedirectCache = () => {
  cache = null
}

const loadEntries = async (origin: string): Promise<Map<string, RedirectEntry>> => {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map

  try {
    const res = await fetch(`${origin}/next/redirects`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`redirects endpoint returned ${res.status}`)

    const entries = (await res.json()) as RedirectEntry[]
    const map = new Map(entries.map((entry) => [entry.from, entry]))
    cache = { map, at: Date.now() }
    return map
  } catch {
    // Serve the last known table rather than dropping every redirect while the
    // endpoint is unhappy; if there is nothing cached yet, match nothing.
    return cache?.map ?? new Map()
  }
}

/**
 * Resolves a redirect for an incoming pathname, or null when there is none.
 * The lookup key is locale- and slash-insensitive (see normalizePath), and the
 * locale the visitor was browsing in is re-applied to relative destinations.
 */
export const findRedirect = async (
  pathname: string,
  origin: string,
): Promise<{ to: string; status: 301 | 302 } | null> => {
  const { path, locale } = normalizePath(pathname)

  const map = await loadEntries(origin)
  const entry = map.get(path)
  if (!entry) return null

  return { to: applyLocale(entry.to, locale), status: entry.status }
}

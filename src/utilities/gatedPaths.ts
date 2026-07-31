/**
 * Paths that stay behind a login while their content is still being reviewed.
 *
 * Set `GATED_PATHS` to a comma-separated list of path prefixes — e.g.
 * `GATED_PATHS=/es,/machines`. A visitor without a Payload session gets
 * redirected to the site root; anyone signed in at `/admin` browses normally.
 *
 * **This hides, it does not protect.** The check is "is there a `payload-token`
 * cookie", and a cookie is trivial to fabricate by hand. That is deliberate and
 * proportionate: what it keeps out of sight is copy the client has not approved
 * yet and pages that should not be indexed — not anything confidential. If a
 * genuinely private route ever needs gating, verify the token's signature
 * instead of trusting its presence, and say so where it is used.
 *
 * Why an env var rather than a field in Settings: this runs in middleware, on
 * every request, where reading a global would mean a database round trip per
 * page view. The tradeoff is that changing it needs a redeploy.
 */
const SESSION_COOKIE = 'payload-token'

export function parseGatedPaths(raw = process.env.GATED_PATHS): string[] {
  return (raw ?? '')
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path) => (path.startsWith('/') ? path : `/${path}`))
    .map((path) => (path.length > 1 ? path.replace(/\/+$/, '') : path))
}

/**
 * Prefix match on a path *segment* boundary, so `/es` gates `/es` and
 * `/es/faq` but not a future `/estadisticas` — the same trap the roadmap
 * already records for `proxy.ts`'s own matcher exclusions.
 */
export function isGatedPath(pathname: string, gated = parseGatedPaths()): boolean {
  return gated.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function hasSessionCookie(cookieNames: Iterable<string>): boolean {
  for (const name of cookieNames) {
    if (name === SESSION_COOKIE) return true
  }
  return false
}

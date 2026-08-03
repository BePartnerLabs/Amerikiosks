import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { findRedirect } from './plugins/redirects/lookup'
import { hasSessionCookie, isGatedPath } from './utilities/gatedPaths'

const intlMiddleware = createMiddleware(routing)

// Kiosk QR codes don't carry machine_id today (see docs/analytics-migration-report.md) —
// the common case is that none of these params are present, and that must be a no-op.
const CAPTURED_PARAMS = ['machine_id', 'utm_source', 'utm_medium', 'utm_campaign']

export default async function middleware(req: NextRequest) {
  // Redirects run before i18n so they can catch any path — including ones with
  // several segments, which have no route and would 404 before the app's
  // <PayloadRedirects> ever rendered.
  const redirect = await findRedirect(req.nextUrl.pathname, req.nextUrl.origin)
  if (redirect) {
    const url = redirect.to.startsWith('http')
      ? redirect.to
      : new URL(redirect.to, req.nextUrl.origin)
    return NextResponse.redirect(url, redirect.status)
  }

  // Content still being reviewed: GATED_PATHS keeps a path behind a Payload
  // session. Hiding, not protecting — see src/utilities/gatedPaths.ts. A
  // redirect rather than a 404 so a gated path is treated as moved rather than
  // broken, and so the visitor lands somewhere useful.
  if (
    isGatedPath(req.nextUrl.pathname) &&
    !hasSessionCookie(req.cookies.getAll().map((c) => c.name))
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin), 307)
  }

  const res = intlMiddleware(req)

  for (const key of CAPTURED_PARAMS) {
    const value = req.nextUrl.searchParams.get(key)
    if (value) {
      res.cookies.set(key, value, { maxAge: 60 * 60 * 24, sameSite: 'lax' })
    }
  }

  return res
}

export const config = {
  // `_next` (not just `_next/static`/`_next/image`) — Next's own internal
  // routes, including the dev HMR websocket at `/_next/webpack-hmr`, must
  // never go through this middleware. That path has no file extension and
  // isn't `_next/static`/`_next/image`, so a narrower exclusion let
  // next-intl's locale-redirect logic run on the HMR upgrade request,
  // corrupting the WebSocket handshake — reproduced as "cannot parse
  // response" errors when the dev server is reached over a LAN IP instead
  // of localhost (found live-debugging a mobile Safari session where every
  // client component's event handlers appeared dead: the corrupted HMR
  // connection broke hydration for the whole page, not just one component).
  //
  // The exclusions are anchored to a whole path segment — `(?:/|$)` — not left
  // as bare prefixes. Unanchored, `admin` also excluded `/administracion`,
  // `api` excluded `/apidocs` and `next` excluded `/next-generation`, and any
  // such slug would silently skip i18n, the redirect lookup *and* the
  // GATED_PATHS check. On a site with Spanish content `/administracion` is not
  // a hypothetical. Same trap the gated-path matcher avoids by comparing
  // segments (see utilities/gatedPaths.ts).
  matcher: ['/((?!(?:admin|api|next|_next|favicon|seed-assets)(?:/|$)|.*\\..*).*)'],
}

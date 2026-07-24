import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Kiosk QR codes don't carry machine_id today (see docs/analytics-migration-report.md) —
// the common case is that none of these params are present, and that must be a no-op.
const CAPTURED_PARAMS = ['machine_id', 'utm_source', 'utm_medium', 'utm_campaign']

export default function middleware(req: NextRequest) {
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
  matcher: ['/((?!admin|api|next|_next|favicon|seed-assets|.*\\..*).*)'],
}

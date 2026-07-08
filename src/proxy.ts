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
  matcher: ['/((?!admin|api|next|_next/static|_next/image|favicon|seed-assets|.*\\..*).*)'],
}

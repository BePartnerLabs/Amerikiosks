import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!admin|api|next|_next/static|_next/image|favicon|seed-assets|.*\\..*).*)'],
}

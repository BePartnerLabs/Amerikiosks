import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD
const COOKIE_NAME = 'preview_access'

export default function middleware(req: NextRequest) {
  // Skip protection if no password configured (local dev)
  if (!PREVIEW_PASSWORD) return intlMiddleware(req)

  const cookie = req.cookies.get(COOKIE_NAME)
  const { pathname } = req.nextUrl

  // Handle password form submission
  if (pathname === '/preview-login' && req.method === 'POST') {
    return NextResponse.next()
  }

  // Already authenticated
  if (cookie?.value === PREVIEW_PASSWORD) return intlMiddleware(req)

  // Check query param (e.g. ?preview=JPlCl39D3J9G)
  const queryPassword = req.nextUrl.searchParams.get('preview')
  if (queryPassword === PREVIEW_PASSWORD) {
    const res = intlMiddleware(req)
    res.cookies.set(COOKIE_NAME, PREVIEW_PASSWORD, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  }

  // Redirect to login page
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/preview-login'
  loginUrl.search = ''
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!admin|api|next|_next/static|_next/image|favicon|seed-assets|.*\\..*).*)'],
}

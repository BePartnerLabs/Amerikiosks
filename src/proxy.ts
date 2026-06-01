import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!admin|api|next|_next/static|_next/image|favicon|.*\\..*).*)'],
}

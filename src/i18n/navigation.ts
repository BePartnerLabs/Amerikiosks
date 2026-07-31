import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Split from `./routing` on purpose. `createNavigation` pulls in the whole of
 * `next/navigation`, so while both lived in one module every consumer of
 * `routing` — including plain helpers like `utilities/localeUrl` that only need
 * the locale list — dragged that dependency along. In tests that surfaced as
 * "No 'redirect' export is defined on the next/navigation mock" in suites that
 * have nothing to do with navigation.
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

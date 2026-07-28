import { NextResponse } from 'next/server'
import { getCachedRedirectEntries } from '@/plugins/redirects/getRedirectEntries'

/**
 * The redirect table, flattened for the middleware.
 *
 * The middleware can't import Payload — that would pull the CMS and the
 * Postgres driver into the critical path of every request — so it reads this
 * endpoint instead and keeps the result in memory. The heavy work stays here,
 * behind `unstable_cache`, and the response is small enough to parse per cold
 * instance without noticing.
 */
export const GET = async () => {
  const entries = await getCachedRedirectEntries()

  return NextResponse.json(entries, {
    headers: {
      // Internal endpoint: the middleware owns its own TTL, and a shared CDN
      // cache would outlive the editor's change in /admin.
      'Cache-Control': 'no-store',
    },
  })
}

import { after } from 'next/server'
import type { CollectionAfterChangeHook } from 'payload'
import type { Claim } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Dispatches a newly created claim to the configured integration target
 * (Monday.com today, Odoo once its REST API is ready — see Phase B) and
 * records the outcome on the same doc. Uses the same `context.<flag>`
 * recursion guard as `revalidatePage.ts`'s `context.disableRevalidate`.
 *
 * Always queues a job (syncClaimToIntegration) and immediately triggers it
 * via an internal "webhook" call to /api/payload-jobs/run, without awaiting
 * that call — the job runs in a separate request, so the customer's submit
 * doesn't wait on the integration's round trip (or, on a cold Neon compute, stack
 * that latency on top of the DB wake-up). A submitted photo (if any) is
 * already durably stored by the time this hook runs — Claims.photoKey
 * points at the private R2 object — so there's no in-memory-only data this
 * hook needs to hand off; the job can look everything up from the doc.
 */
export const syncClaim: CollectionAfterChangeHook<Claim> = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipClaimsSync) {
    return doc
  }

  await req.payload.jobs.queue({
    task: 'syncClaimToIntegration',
    input: { claimId: doc.id },
    req,
  })

  // Without a secret the run endpoint answers 401 and the job sits queued. It
  // used to send `Bearer undefined` and swallow the rejection, so a missing env
  // var looked exactly like everything working. Say so instead: the claim is
  // stored either way, and someone has to press Resync.
  if (!process.env.CRON_SECRET) {
    req.payload.logger.error(
      `syncClaim: CRON_SECRET is not set, so claim ${doc.id} was queued but not triggered. It will stay in syncStatus 'pending' until it is resynced from /admin.`,
    )
    return doc
  }

  const runUrl = `${getServerSideURL()}/api/payload-jobs/run`
  const trigger = () =>
    fetch(runUrl, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch((err) => {
      req.payload.logger.error(
        `syncClaim: failed to trigger job run for claim ${doc.id}: ${err.message}`,
      )
    })

  // Not awaited — the customer's submit must not wait on the integration's
  // round trip. But not left dangling either: on Vercel the function can be
  // frozen the moment the response is sent, and an un-awaited fetch is then
  // simply never dispatched. That is how a claim ends up queued forever with
  // syncStatus 'pending' and nobody the wiser.
  //
  // `after` keeps the invocation alive until the work finishes. It throws
  // outside a Next request scope (a script, a seed, a test), where nothing is
  // going to freeze anyway — so fall back to firing it directly there.
  try {
    after(trigger)
  } catch {
    void trigger()
  }

  return doc
}

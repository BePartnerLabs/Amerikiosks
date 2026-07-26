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

  // Fire-and-forget on purpose: triggering the run endpoint is the "webhook"
  // that makes the queued job execute now instead of waiting for the next
  // scheduled/cron run. Never awaited — the whole point is not blocking the
  // customer's response on this.
  const runUrl = `${getServerSideURL()}/api/payload-jobs/run`
  fetch(runUrl, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch((err) => {
    req.payload.logger.error(
      `syncClaim: failed to trigger job run for claim ${doc.id}: ${err.message}`,
    )
  })

  return doc
}

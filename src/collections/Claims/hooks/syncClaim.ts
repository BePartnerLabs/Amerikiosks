import type { CollectionAfterChangeHook } from 'payload'
import type { Claim } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { dispatchClaimSync } from '../dispatchClaimSync'

type PhotoContext = { buffer: Buffer; filename: string; contentType: string }

/**
 * Dispatches a newly created claim to the configured integration target
 * (JotForm today, Odoo once its REST API is ready — see Phase B) and records
 * the outcome on the same doc. Uses the same `context.<flag>` recursion guard
 * as `revalidatePage.ts`'s `context.disableRevalidate`.
 *
 * Two paths, split on whether a photo is present:
 * - No photo (the common case): queue a job (syncClaimToIntegration) and
 *   immediately trigger it via an internal "webhook" call to
 *   /api/payload-jobs/run, without awaiting that call. The job runs in a
 *   separate request, so the customer's submit doesn't wait on JotForm's
 *   round trip (or, on a cold Neon compute, stack that latency on top of the
 *   DB wake-up).
 * - Photo present: stays synchronous, dispatched directly here. The photo
 *   only exists in memory for this one request (next/claims-submit/route.ts
 *   stashes it on req.context, never persisted to Claims.photo or Media —
 *   see that field's admin description for why) — a queued job running later
 *   in a different request has no way to reach it.
 */
export const syncClaim: CollectionAfterChangeHook<Claim> = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipClaimsSync) {
    return doc
  }

  const photo = req.context?.photoFile as PhotoContext | undefined

  if (photo) {
    await dispatchClaimSync(doc, req, photo)
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

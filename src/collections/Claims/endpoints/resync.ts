import type { Endpoint } from 'payload'
import type { Claim } from '@/payload-types'
import { dispatchClaimSync } from '../dispatchClaimSync'

type ResyncResult = { id: Claim['id']; ok: boolean; error?: string }

// Same reasoning as the form-submissions endpoint: an unbounded run over a
// backlog, each with a Monday round trip, ends at the function timeout, and a
// run killed halfway leaves nobody able to say how far it got. Bounded batch,
// with the leftover count in the response so the operator knows to press again.
const RESYNC_BATCH_LIMIT = 25

async function resyncOne(claimId: Claim['id'], req: Parameters<Endpoint['handler']>[0]) {
  const claim = await req.payload.findByID({ collection: 'claims', id: claimId, depth: 0, req })
  try {
    await dispatchClaimSync(claim, req)
    return { id: claim.id, ok: true }
  } catch (err) {
    return { id: claim.id, ok: false, error: (err as Error).message }
  }
}

// Manual retry for claims whose sync already failed (jobs don't self-retry
// once they hit max attempts — see syncClaimTask.ts) or for staff who just
// want to force a re-send on any claim regardless of its current status.
// Body: { claimId?: string | number } — a specific claim, or omitted to
// resync every claim currently marked syncStatus: 'error'.
export const resyncEndpoint: Endpoint = {
  path: '/resync',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json?.()) as { claimId?: string | number } | undefined
    const claimId = body?.claimId

    if (claimId) {
      const result = await resyncOne(Number(claimId), req)
      return Response.json(result)
    }

    const { docs, totalDocs } = await req.payload.find({
      collection: 'claims',
      where: { syncStatus: { equals: 'error' } },
      depth: 0,
      limit: RESYNC_BATCH_LIMIT,
      req,
    })

    const results: ResyncResult[] = []
    for (const doc of docs) {
      results.push(await resyncOne(doc.id, req))
    }

    return Response.json({
      processed: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok),
      remaining: Math.max(0, totalDocs - docs.length),
    })
  },
}

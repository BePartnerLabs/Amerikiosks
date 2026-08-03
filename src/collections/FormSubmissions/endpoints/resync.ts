import type { Endpoint } from 'payload'
import { syncFormSubmission } from '../hooks/syncFormSubmission'

type ResyncResult = { id: unknown; ok: boolean; error?: string }

/**
 * How many failed submissions one bulk run will retry.
 *
 * It used to fetch every errored doc with `limit: 0` and walk them one at a
 * time, each with a Monday round trip and, for anything with an attachment, an
 * R2 download on top. A backlog of any size therefore ran until the function
 * timed out — and a run killed halfway is worse than one that stops on purpose,
 * because nobody can tell how far it got.
 *
 * A bounded batch always finishes, and the response says how many are left so
 * the operator knows to press it again. Sequential on purpose: Monday rate
 * limits, and firing a backlog at it in parallel trades one failure mode for
 * another.
 */
const RESYNC_BATCH_LIMIT = 25

async function resyncOne(submissionId: unknown, req: Parameters<Endpoint['handler']>[0]) {
  const doc = await req.payload.findByID({
    collection: 'form-submissions',
    id: submissionId as string | number,
    depth: 0,
    req,
    overrideAccess: true,
  })
  try {
    await syncFormSubmission({ payload: req.payload, doc: doc as never })
    const refreshed = await req.payload.findByID({
      collection: 'form-submissions',
      id: doc.id,
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (refreshed.syncStatus === 'error') {
      return { id: doc.id, ok: false, error: refreshed.syncError ?? 'Sync failed' }
    }
    return { id: doc.id, ok: true }
  } catch (err) {
    return { id: doc.id, ok: false, error: (err as Error).message }
  }
}

// Manual retry for form submissions whose Monday sync already failed — same
// shape as Claims' /resync endpoint. Body: { submissionId?: string | number }
// for a single submission, or omitted to resync every submission currently
// marked syncStatus: 'error'.
export const resyncEndpoint: Endpoint = {
  path: '/resync',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json?.()) as { submissionId?: string | number } | undefined
    const submissionId = body?.submissionId

    if (submissionId) {
      const result = await resyncOne(submissionId, req)
      return Response.json(result)
    }

    const { docs, totalDocs } = await req.payload.find({
      collection: 'form-submissions',
      where: { syncStatus: { equals: 'error' } },
      depth: 0,
      limit: RESYNC_BATCH_LIMIT,
      req,
      overrideAccess: true,
    })

    const results: ResyncResult[] = []
    for (const doc of docs) {
      results.push(await resyncOne(doc.id, req))
    }

    // Counted before the run, so it does not include anything this batch just
    // fixed. What is left for a second press is whatever did not fit.
    const remaining = Math.max(0, totalDocs - docs.length)

    return Response.json({
      processed: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok),
      remaining,
    })
  },
}

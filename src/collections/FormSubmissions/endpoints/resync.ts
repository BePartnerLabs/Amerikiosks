import type { Endpoint } from 'payload'
import { dispatchFormSync } from '../hooks/dispatchFormSync'

type ResyncResult = { id: unknown; ok: boolean; error?: string }

async function resyncOne(submissionId: unknown, req: Parameters<Endpoint['handler']>[0]) {
  const doc = await req.payload.findByID({
    collection: 'form-submissions',
    id: submissionId as string | number,
    depth: 0,
    req,
    overrideAccess: true,
  })
  try {
    await dispatchFormSync({ doc, operation: 'create', req } as never)
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

    const { docs } = await req.payload.find({
      collection: 'form-submissions',
      where: { syncStatus: { equals: 'error' } },
      depth: 0,
      limit: 0,
      req,
      overrideAccess: true,
    })

    const results: ResyncResult[] = []
    for (const doc of docs) {
      results.push(await resyncOne(doc.id, req))
    }

    return Response.json({
      processed: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok),
    })
  },
}

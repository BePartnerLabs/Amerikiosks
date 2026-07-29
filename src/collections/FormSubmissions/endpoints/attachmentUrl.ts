import type { Endpoint } from 'payload'
import { getPresignedUrlForKey } from '@/utilities/privateUpload'

type AttachmentRow = { field?: string | null; key?: string | null }

// Mints a short-lived (15-minute) presigned URL for one of a submission's
// attachments, on demand — the private R2 bucket has no public access, so
// this is the only way to view it. Mirrors Claims' /:id/photo-url, including
// the gate: an authenticated admin session, not a shared token.
export const attachmentUrlEndpoint: Endpoint = {
  path: '/:id/attachment-url',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id
    if (typeof id !== 'string' && typeof id !== 'number') {
      return Response.json({ error: 'Missing submission id' }, { status: 400 })
    }

    const submission = await req.payload.findByID({
      collection: 'form-submissions',
      id,
      depth: 0,
      overrideAccess: false,
      req,
    })

    const attachments = ((submission as { attachments?: AttachmentRow[] }).attachments ??
      []) as AttachmentRow[]

    // A submission can carry more than one upload field, so the caller says
    // which one it wants; with none named, the first is a sensible default.
    const wanted = new URL(req.url ?? '', 'http://localhost').searchParams.get('field')
    const row = wanted ? attachments.find((a) => a.field === wanted) : attachments[0]

    if (!row?.key) {
      return Response.json({ error: 'This submission has no such attachment' }, { status: 404 })
    }

    const url = await getPresignedUrlForKey(row.key)
    return Response.json({ url })
  },
}

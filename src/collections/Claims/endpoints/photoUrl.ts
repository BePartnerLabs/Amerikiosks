import type { Endpoint } from 'payload'
import { getPresignedUrlForKey } from '@/utilities/privateUpload'

// Mints a short-lived (15-minute) presigned URL for a claim's customer-
// submitted photo, on demand — the private R2 bucket has no public access,
// so this is the only way to view it. Gated behind an authenticated admin
// session (same criterion as Claims.read), not a shared token: matches how
// the rest of this project's admin-only data access works.
export const photoUrlEndpoint: Endpoint = {
  path: '/:id/photo-url',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id
    if (typeof id !== 'string' && typeof id !== 'number') {
      return Response.json({ error: 'Missing claim id' }, { status: 400 })
    }

    const claim = await req.payload.findByID({
      collection: 'claims',
      id,
      depth: 0,
      overrideAccess: false,
      req,
    })

    if (!claim.photoKey) {
      return Response.json({ error: 'This claim has no submitted photo' }, { status: 404 })
    }

    const url = await getPresignedUrlForKey(claim.photoKey)
    return Response.json({ url })
  },
}

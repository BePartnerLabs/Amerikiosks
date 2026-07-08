import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: Request) {
  const body = await req.json()
  const payload = await getPayload({ config: configPromise })

  try {
    const claim = await payload.create({
      collection: 'claims',
      data: body,
      overrideAccess: false,
    })

    return Response.json(claim, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

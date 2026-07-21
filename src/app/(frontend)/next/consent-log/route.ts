import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: Request) {
  const body = await req.json()
  const payload = await getPayload({ config: configPromise })

  try {
    const log = await payload.create({
      collection: 'consentLogs',
      data: {
        consentId: body.consentId,
        analytics: body.analytics,
        policyVersion: body.policyVersion,
      },
      overrideAccess: false,
    })

    return Response.json(log, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

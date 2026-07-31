import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { createRateLimiter, getClientIp, RATE_LIMITS } from '@/utilities/rateLimit'

// More generous than the form endpoints: one visitor legitimately writes
// several rows in a sitting (accept, then reopen the panel and save again), and
// unlike a lead form there is nothing lost by being lenient. The point is only
// to stop an unauthenticated endpoint from growing a table without bound.
const isRateLimited = createRateLimiter(RATE_LIMITS.consentLog)

// consentId is a UUID (or a base36 timestamp fallback) and policyVersion a
// short tag. Both come from our own client, so anything longer is a bug or an
// attempt to store arbitrary data. Truncated rather than rejected, so a
// malformed value never costs a real consent record — the evidence matters
// more than the tidiness of the row.
const MAX_FIELD_LENGTH = 128

function asBoundedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, MAX_FIELD_LENGTH) : undefined
}

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return Response.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  // A malformed body used to throw straight out of the handler and surface as a
  // 500 on a public endpoint. It is a bad request, and it is the caller's.
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const consentId = asBoundedString(body.consentId)
  if (!consentId) {
    return Response.json({ error: 'Missing consentId.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const log = await payload.create({
      collection: 'consentLogs',
      data: {
        consentId,
        analytics: body.analytics === true,
        policyVersion: asBoundedString(body.policyVersion),
      },
      overrideAccess: false,
    })

    // Write-only evidence: the browser has no use for the row, and echoing it
    // back hands an anonymous caller a readback of what was stored.
    return Response.json({ id: log.id }, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

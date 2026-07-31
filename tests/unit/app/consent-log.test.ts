import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

// The limiter's Map lives at module scope and survives every test in this file,
// so each request gets its own IP unless a test is specifically exercising the
// limit. Same approach as form-submissions.test.ts.
let requestCounter = 0

function request(body: unknown, ip?: string) {
  requestCounter += 1
  return new Request('http://localhost/next/consent-log', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip ?? `10.0.0.${requestCounter}`,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const create = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  create.mockResolvedValue({ id: 7, consentId: 'abc', analytics: true })
  mockGetPayload.mockResolvedValue({ create } as never)
})

describe('POST /next/consent-log', () => {
  it('stores the consent record and returns only its id', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')
    const res = await POST(request({ consentId: 'abc-123', analytics: true }))

    expect(res.status).toBe(201)
    // Write-only evidence: echoing the row back gives an anonymous caller a
    // readback of what was stored.
    await expect(res.json()).resolves.toEqual({ id: 7 })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'consentLogs',
        data: expect.objectContaining({ consentId: 'abc-123', analytics: true }),
        overrideAccess: false,
      }),
    )
  })

  // Used to throw out of the handler and surface as a 500 on a public endpoint.
  it('answers 400 on a malformed body instead of throwing', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')
    const res = await POST(request('{ not json'))

    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects a request with no consentId', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')
    const res = await POST(request({ analytics: true }))

    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('truncates oversized values rather than storing them whole', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')
    await POST(
      request({ consentId: 'x'.repeat(5_000), policyVersion: 'y'.repeat(5_000), analytics: true }),
    )

    const data = create.mock.calls[0]?.[0]?.data
    expect(data.consentId).toHaveLength(128)
    expect(data.policyVersion).toHaveLength(128)
  })

  // `analytics` is what decides whether GA4 loads, so a string, a number or a
  // missing value must never be stored as consent.
  it('only stores analytics consent when it is literally true', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')
    await POST(request({ consentId: 'a', analytics: 'yes' }))

    expect(create.mock.calls[0]?.[0]?.data.analytics).toBe(false)
  })

  it('rate-limits a caller hammering the endpoint from one address', async () => {
    const { POST } = await import('@/app/(frontend)/next/consent-log/route')

    const statuses: number[] = []
    for (let i = 0; i < 25; i++) {
      const res = await POST(request({ consentId: `id-${i}` }, '203.0.113.9'))
      statuses.push(res.status)
    }

    expect(statuses.filter((s) => s === 201)).toHaveLength(20)
    expect(statuses.at(-1)).toBe(429)
  })
})

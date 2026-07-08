import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

const validBody = {
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerName: 'Test Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: { state: 'FL', city: 'Doral', propertyName: 'BePartnerLabs Test Property' },
  claimReason: 'partial_dispense',
  machineId: 'AK-0231',
}

function callPOST(body: unknown) {
  return import('@/app/(frontend)/next/claims-submit/route').then(({ POST }) =>
    POST(
      new Request('http://localhost:3000/next/claims-submit', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    ),
  )
}

describe('POST /next/claims-submit', () => {
  it('creates a claim via the Local API (overrideAccess: false) and returns 201', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1, ...validBody })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const res = await callPOST(validBody)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'claims',
        data: expect.objectContaining({ customerName: 'Test Prueba', machineId: 'AK-0231' }),
        overrideAccess: false,
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toMatchObject({ id: 1 })
  })

  it('returns 400 when Payload rejects the submission (e.g. missing required field)', async () => {
    const create = vi
      .fn()
      .mockRejectedValue(new Error('ValidationError: customerEmail is required'))
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const res = await callPOST({ ...validBody, customerEmail: undefined })

    expect(res.status).toBe(400)
  })
})

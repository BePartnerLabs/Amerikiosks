import { afterEach, describe, expect, it, vi } from 'vitest'

const jotFormSubmit = vi.fn()
const odooSubmit = vi.fn()

vi.mock('@/repositories', () => ({
  JotFormRepository: { submit: jotFormSubmit },
  OdooRepository: { submit: odooSubmit },
}))

afterEach(() => {
  vi.clearAllMocks()
})

const baseDoc = {
  id: 'claim-1',
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerName: 'Test Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: { state: 'FL', city: 'Doral', propertyName: 'BePartnerLabs Test Property' },
  claimReason: 'partial_dispense',
  integrationTarget: 'jotform',
  syncStatus: 'pending',
}

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    payload: {
      update: vi.fn().mockResolvedValue(undefined),
      logger: { info: vi.fn(), error: vi.fn() },
    },
    context: {},
    ...overrides,
  }
}

describe('syncClaim', () => {
  it('on create with integrationTarget "jotform", calls JotFormRepository.submit and marks the doc synced', async () => {
    jotFormSubmit.mockResolvedValue({ responseCode: 200 })
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(jotFormSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ customerName: 'Test Prueba' }),
    )
    expect(odooSubmit).not.toHaveBeenCalled()
    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'claims',
        id: 'claim-1',
        data: expect.objectContaining({ syncStatus: 'synced' }),
        context: { skipClaimsSync: true },
      }),
    )
  })

  it('on create with integrationTarget "odoo", calls OdooRepository.submit instead', async () => {
    odooSubmit.mockResolvedValue({ ok: true })
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    await syncClaim({
      doc: { ...baseDoc, integrationTarget: 'odoo' },
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    expect(odooSubmit).toHaveBeenCalled()
    expect(jotFormSubmit).not.toHaveBeenCalled()
  })

  it('when the repository submit rejects, records syncStatus "error" with syncError, without throwing (claim must still persist)', async () => {
    jotFormSubmit.mockRejectedValue(new Error('ServerHttpClient: POST ... failed with 500'))
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          syncStatus: 'error',
          syncError: expect.stringContaining('failed with 500'),
        }),
        context: { skipClaimsSync: true },
      }),
    )
  })

  it('does nothing on update operations (no repository call, no payload.update)', async () => {
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: baseDoc,
      operation: 'update',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(jotFormSubmit).not.toHaveBeenCalled()
    expect(odooSubmit).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
  })

  it('does nothing when context.skipClaimsSync is set (recursion guard for the hook-triggered update itself)', async () => {
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq({ context: { skipClaimsSync: true } })

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(jotFormSubmit).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
  })
})

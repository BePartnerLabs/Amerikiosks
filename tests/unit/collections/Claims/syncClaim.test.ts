import { afterEach, describe, expect, it, vi } from 'vitest'

const dispatchClaimSyncMock = vi.fn().mockResolvedValue(undefined)
vi.mock('@/collections/Claims/dispatchClaimSync', () => ({
  dispatchClaimSync: dispatchClaimSyncMock,
}))

vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'http://localhost:3000',
}))

const fetchMock = vi.fn().mockResolvedValue({ ok: true })

afterEach(() => {
  vi.clearAllMocks()
})

const baseDoc = {
  id: 'claim-1',
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerFirstName: 'Test',
  customerLastName: 'Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: 'BePartnerLabs Test Property, Doral, FL',
  claimReason: 'partial_dispense',
  integrationTarget: 'monday',
  syncStatus: 'pending',
}

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    payload: {
      jobs: { queue: vi.fn().mockResolvedValue({ id: 'job-1' }) },
      update: vi.fn().mockResolvedValue(undefined),
      logger: { info: vi.fn(), error: vi.fn() },
    },
    context: {},
    ...overrides,
  }
}

describe('syncClaim', () => {
  it('no photo: queues syncClaimToIntegration and triggers /api/payload-jobs/run without awaiting it, does not dispatch directly', async () => {
    vi.stubGlobal('fetch', fetchMock)
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(req.payload.jobs.queue).toHaveBeenCalledWith(
      expect.objectContaining({
        task: 'syncClaimToIntegration',
        input: { claimId: 'claim-1' },
      }),
    )
    expect(dispatchClaimSyncMock).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/payload-jobs/run',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    )
    vi.unstubAllGlobals()
  })

  it('does nothing on update operations (no queue, no dispatch)', async () => {
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    const result = await syncClaim({
      doc: baseDoc,
      previousDoc: baseDoc,
      operation: 'update',
      req,
    } as never)

    expect(result).toBe(baseDoc)
    expect(dispatchClaimSyncMock).not.toHaveBeenCalled()
    expect(req.payload.jobs.queue).not.toHaveBeenCalled()
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
    expect(dispatchClaimSyncMock).not.toHaveBeenCalled()
    expect(req.payload.jobs.queue).not.toHaveBeenCalled()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

const dispatchClaimSyncMock = vi.fn().mockResolvedValue(undefined)
vi.mock('@/collections/Claims/dispatchClaimSync', () => ({
  dispatchClaimSync: dispatchClaimSyncMock,
}))

vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'http://localhost:3000',
}))

// `after` is what keeps the invocation alive past the response. Recorded rather
// than executed, so a test can assert the trigger was handed to it — and then
// run it, which is what Next does for real.
const afterMock = vi.fn((cb: () => unknown) => {
  afterCallbacks.push(cb)
})
const afterCallbacks: Array<() => unknown> = []
vi.mock('next/server', () => ({ after: (cb: () => unknown) => afterMock(cb) }))

const fetchMock = vi.fn().mockResolvedValue({ ok: true })

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  afterCallbacks.length = 0
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
    vi.stubEnv('CRON_SECRET', 'secret')
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

    // Deferred through `after` now, so it has to be run to be observed — see
    // the dedicated case below for why.
    await afterCallbacks[0]?.()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/payload-jobs/run',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    )
    vi.unstubAllGlobals()
  })

  // The bug: an un-awaited fetch is never dispatched if Vercel freezes the
  // function the moment the response is sent, so the job stays queued and the
  // claim sits at syncStatus 'pending' with nobody the wiser.
  it('hands the trigger to `after` so it survives the response', async () => {
    vi.stubEnv('CRON_SECRET', 'secret')
    vi.stubGlobal('fetch', fetchMock)
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')

    await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req: makeReq(),
    } as never)

    expect(afterMock).toHaveBeenCalledTimes(1)
    // Not fired yet — that is the point: Next runs it after the response.
    expect(fetchMock).not.toHaveBeenCalled()

    await afterCallbacks[0]?.()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/payload-jobs/run',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
      }),
    )
    vi.unstubAllGlobals()
  })

  // It used to send `Bearer undefined`, get a 401 and swallow it — a missing
  // env var looked exactly like everything working.
  it('says so and skips the trigger when CRON_SECRET is missing', async () => {
    vi.stubEnv('CRON_SECRET', '')
    vi.stubGlobal('fetch', fetchMock)
    const { syncClaim } = await import('@/collections/Claims/hooks/syncClaim')
    const req = makeReq()

    await syncClaim({
      doc: baseDoc,
      previousDoc: undefined,
      operation: 'create',
      req,
    } as never)

    // The claim is still queued — it is stored either way, and Resync exists.
    expect(req.payload.jobs.queue).toHaveBeenCalled()
    expect(afterMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(req.payload.logger.error).toHaveBeenCalledWith(expect.stringContaining('CRON_SECRET'))
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

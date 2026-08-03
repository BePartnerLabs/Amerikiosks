import { afterEach, describe, expect, it, vi } from 'vitest'

const dispatchClaimSyncMock = vi.fn()
vi.mock('@/collections/Claims/dispatchClaimSync', () => ({
  dispatchClaimSync: dispatchClaimSyncMock,
}))

const findByIDMock = vi.fn()
const findMock = vi.fn()

function fakeReq({ user = { id: 'staff-1' }, body }: { user?: unknown; body?: unknown } = {}) {
  return {
    user,
    json: async () => body,
    payload: { findByID: findByIDMock, find: findMock },
  } as never
}

describe('resyncEndpoint', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ user: null }))
    expect(res.status).toBe(401)
  })

  it('resyncs a single claim by id and reports success', async () => {
    findByIDMock.mockResolvedValue({ id: 3 })
    dispatchClaimSyncMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: { claimId: 3 } }))
    const json = await res.json()

    expect(findByIDMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'claims', id: 3 }),
    )
    expect(dispatchClaimSyncMock).toHaveBeenCalledTimes(1)
    expect(json).toEqual({ id: 3, ok: true })
  })

  it('reports failure without throwing when dispatchClaimSync rejects for a single claim', async () => {
    findByIDMock.mockResolvedValue({ id: 3 })
    dispatchClaimSyncMock.mockRejectedValue(new Error('Monday API returned errors: boom'))

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: { claimId: 3 } }))
    const json = await res.json()

    expect(json).toEqual({ id: 3, ok: false, error: 'Monday API returned errors: boom' })
  })

  it('resyncs every claim with syncStatus: error when no claimId is given', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1 }, { id: 2 }], totalDocs: 2 })
    findByIDMock.mockImplementation(async ({ id }: { id: number }) => ({ id }))
    dispatchClaimSyncMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('still broken'))

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))
    const json = await res.json()

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'claims',
        where: { syncStatus: { equals: 'error' } },
      }),
    )
    expect(json.processed).toBe(2)
    expect(json.succeeded).toBe(1)
    expect(json.failed).toEqual([{ id: 2, ok: false, error: 'still broken' }])
  })

  // It used to fetch every errored claim with `limit: 0` and walk them one at a
  // time, each with a Monday round trip. A backlog of any size ran until the
  // function timed out, and a run killed halfway leaves nobody able to say how
  // far it got.
  it('asks for a bounded batch rather than every errored claim', async () => {
    findMock.mockResolvedValue({ docs: [], totalDocs: 0 })

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    await resyncEndpoint.handler(fakeReq({ body: {} }))

    const [args] = findMock.mock.calls[0]
    expect(args.limit).toBeGreaterThan(0)
    expect(args.limit).toBeLessThanOrEqual(50)
  })

  it('reports how many are left so the operator knows to press again', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1 }], totalDocs: 40 })
    findByIDMock.mockImplementation(async ({ id }: { id: number }) => ({ id }))
    dispatchClaimSyncMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))

    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({ processed: 1, remaining: 39 }),
    )
  })

  it('reports nothing left when the batch covered everything', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1 }], totalDocs: 1 })
    findByIDMock.mockImplementation(async ({ id }: { id: number }) => ({ id }))
    dispatchClaimSyncMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/Claims/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))

    await expect(res.json()).resolves.toEqual(expect.objectContaining({ remaining: 0 }))
  })
})

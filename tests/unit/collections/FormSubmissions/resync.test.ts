import { afterEach, describe, expect, it, vi } from 'vitest'

const syncFormSubmissionMock = vi.fn()
vi.mock('@/collections/FormSubmissions/hooks/syncFormSubmission', () => ({
  syncFormSubmission: syncFormSubmissionMock,
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

afterEach(() => {
  vi.resetAllMocks()
})

describe('form-submissions resync endpoint', () => {
  it('returns 401 when unauthenticated', async () => {
    const { resyncEndpoint } = await import('@/collections/FormSubmissions/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ user: null }))
    expect(res.status).toBe(401)
  })

  // It used to fetch every errored submission with `limit: 0` and walk them one
  // at a time — a Monday round trip each, plus an R2 download for anything with
  // an attachment. A backlog ran until the function timed out, and a run killed
  // halfway leaves nobody able to say how far it got.
  it('asks for a bounded batch rather than every errored submission', async () => {
    findMock.mockResolvedValue({ docs: [], totalDocs: 0 })

    const { resyncEndpoint } = await import('@/collections/FormSubmissions/endpoints/resync')
    await resyncEndpoint.handler(fakeReq({ body: {} }))

    const [args] = findMock.mock.calls[0]
    expect(args.limit).toBeGreaterThan(0)
    expect(args.limit).toBeLessThanOrEqual(50)
  })

  it('reports how many are left so the operator knows to press again', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1 }], totalDocs: 40 })
    findByIDMock.mockResolvedValue({ id: 1, syncStatus: 'synced' })
    syncFormSubmissionMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/FormSubmissions/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))

    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({ processed: 1, succeeded: 1, remaining: 39 }),
    )
  })

  it('reports nothing left when the batch covered everything', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1 }], totalDocs: 1 })
    findByIDMock.mockResolvedValue({ id: 1, syncStatus: 'synced' })
    syncFormSubmissionMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/FormSubmissions/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))

    await expect(res.json()).resolves.toEqual(expect.objectContaining({ remaining: 0 }))
  })

  // The hook records its own failures on the document rather than throwing, so
  // the endpoint has to read the status back to know what happened.
  it('counts a submission the hook left in error as failed', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7 }], totalDocs: 1 })
    findByIDMock.mockResolvedValue({ id: 7, syncStatus: 'error', syncError: 'column rejected' })
    syncFormSubmissionMock.mockResolvedValue(undefined)

    const { resyncEndpoint } = await import('@/collections/FormSubmissions/endpoints/resync')
    const res = await resyncEndpoint.handler(fakeReq({ body: {} }))

    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({
        succeeded: 0,
        failed: [{ id: 7, ok: false, error: 'column rejected' }],
      }),
    )
  })
})

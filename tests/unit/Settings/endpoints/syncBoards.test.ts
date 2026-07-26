import { afterEach, describe, expect, it, vi } from 'vitest'

const findGlobalMock = vi.fn()
const updateGlobalMock = vi.fn()

function fakeReq({ user = { id: 'staff-1' } }: { user?: unknown } = {}) {
  return {
    user,
    payload: { findGlobal: findGlobalMock, updateGlobal: updateGlobalMock },
  } as never
}

const mondayBoardsResponse = {
  data: {
    boards: [
      {
        id: '4042731281',
        name: 'Contact Us - AK',
        groups: [{ id: 'topics', title: 'Group Title' }],
        columns: [
          { id: 'text', title: 'Name', type: 'name' },
          { id: 'email', title: 'Email', type: 'email' },
        ],
      },
    ],
  },
}

describe('syncBoardsEndpoint', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns 401 when unauthenticated', async () => {
    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq({ user: null }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when no mondayApiToken is configured', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: '' })

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())
    expect(res.status).toBe(400)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })

  it('fetches boards from Monday and writes the cache on success', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => mondayBoardsResponse,
      }),
    )

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())
    const json = await res.json()

    expect(fetch).toHaveBeenCalledWith(
      'https://api.monday.com/v2',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'test-token' }),
      }),
    )
    expect(updateGlobalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'settings',
        data: {
          mondayBoardsCache: expect.objectContaining({
            boards: mondayBoardsResponse.data.boards,
            syncedAt: expect.any(String),
          }),
        },
      }),
    )
    expect(json.boards).toEqual(mondayBoardsResponse.data.boards)
  })

  it('returns 502 and does not touch the cache when Monday returns GraphQL errors', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ errors: [{ message: 'Invalid token' }] }),
      }),
    )

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())

    expect(res.status).toBe(502)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })

  it('returns 502 and does not touch the cache when the fetch itself throws', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())

    expect(res.status).toBe(502)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })
})

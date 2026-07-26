import type { Endpoint } from 'payload'

const MONDAY_API_URL = 'https://api.monday.com/v2'

const BOARDS_QUERY = `query {
  boards (limit: 200) {
    id
    name
    groups { id title }
    columns { id title type }
  }
}`

type MondayBoardsQueryResponse = {
  data?: {
    boards: Array<{
      id: string
      name: string
      groups: Array<{ id: string; title: string }>
      columns: Array<{ id: string; title: string; type: string }>
    }>
  }
  errors?: Array<{ message: string }>
}

// Manual refresh for the Monday.com boards/groups/columns cache shown in
// Settings → Integrations. Never runs automatically — an admin clicks
// "Refresh Monday Boards". On any failure, the existing cache (and its
// syncedAt) is left untouched so the UI keeps showing the last-known-good
// snapshot instead of going blank.
export const syncBoardsEndpoint: Endpoint = {
  path: '/sync-monday-boards',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await req.payload.findGlobal({ slug: 'settings', req })
    const apiToken = settings.mondayApiToken

    if (!apiToken) {
      return Response.json(
        { error: 'No Monday.com API token configured in Settings → Integrations.' },
        { status: 400 },
      )
    }

    let body: MondayBoardsQueryResponse
    try {
      const res = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: apiToken },
        body: JSON.stringify({ query: BOARDS_QUERY }),
      })
      body = (await res.json()) as MondayBoardsQueryResponse
    } catch (err) {
      return Response.json(
        { error: `Failed to reach Monday.com: ${(err as Error).message}` },
        { status: 502 },
      )
    }

    if (body.errors?.length || !body.data) {
      return Response.json(
        { error: `Monday.com API error: ${body.errors?.map((e) => e.message).join(', ')}` },
        { status: 502 },
      )
    }

    const mondayBoardsCache = {
      syncedAt: new Date().toISOString(),
      boards: body.data.boards,
    }

    await req.payload.updateGlobal({
      slug: 'settings',
      // biome-ignore lint/suspicious/noExplicitAny: mondayBoardsCache field is added to the Settings global in the following task; payload-types.ts doesn't know about it yet
      data: { mondayBoardsCache } as any,
      req,
    })

    return Response.json(mondayBoardsCache)
  },
}

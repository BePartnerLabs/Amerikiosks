export type MondayBoardColumn = {
  id: string
  title: string
  type: string
}

export type MondayBoardCache = {
  id: string
  name: string
  groups: Array<{ id: string; title: string }>
  columns: MondayBoardColumn[]
}

export type MondayBoardsCache = {
  syncedAt: string
  boards: MondayBoardCache[]
}

export type MondayDriftForm = {
  externalId?: string | null
  fields?: Array<{ externalId?: string | null }>
}

export type MondayDriftResult = {
  boardFound: boolean
  missingColumnIds: string[]
}

/**
 * Compares a form's board id + field column ids against a cached Monday
 * schema snapshot. Only detects columns that no longer exist at all — a
 * column that changed type without being deleted is out of scope (see
 * docs/superpowers/specs/2026-07-25-monday-boards-cache-design.md).
 */
export function detectMondayDrift(
  form: MondayDriftForm,
  cache: MondayBoardsCache | null | undefined,
): MondayDriftResult {
  if (!cache || !form.externalId) {
    return { boardFound: false, missingColumnIds: [] }
  }

  const board = cache.boards.find((b) => b.id === form.externalId)
  if (!board) {
    return { boardFound: false, missingColumnIds: [] }
  }

  const validColumnIds = new Set(board.columns.map((c) => c.id))
  const missingColumnIds = (form.fields ?? [])
    .map((f) => f.externalId)
    .filter((id): id is string => Boolean(id) && !validColumnIds.has(id as string))

  return { boardFound: true, missingColumnIds }
}

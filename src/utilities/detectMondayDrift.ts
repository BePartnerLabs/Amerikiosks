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

// Which Monday column types a given form field block can sync into without
// GenericMondayRepository.buildColumnValue producing a shape Monday
// rejects (see dispatchFormSync.ts) — this is the config-time counterpart
// of that runtime type-aware value builder, so a mismatch gets caught while
// editing the form instead of surfacing as a failed submission later.
const COMPATIBLE_COLUMN_TYPES: Record<string, string[]> = {
  text: ['text', 'long_text'],
  textarea: ['long_text', 'text'],
  email: ['email', 'text'],
  number: ['numbers', 'text'],
  select: ['status', 'dropdown', 'text'],
  checkbox: ['checkbox'],
  country: ['country', 'dropdown', 'text'],
  state: ['dropdown', 'text'],
  upload: ['file'],
}

/**
 * Validates a single field's Monday column id against the selected board's
 * cached columns — both that the id still exists, and (when a field
 * blockType is known) that the column's type is one this field can
 * actually sync into. Fails open (returns true) whenever we can't be
 * confident about the answer — no board selected yet, no cache synced, the
 * board itself isn't in the cache, or the blockType has no known
 * compatibility list — so this only ever blocks save on a case we're sure
 * is wrong, per the same reasoning as detectMondayDrift.
 */
export function validateMondayColumnId(
  columnId: string | null | undefined,
  boardId: string | null | undefined,
  cache: MondayBoardsCache | null | undefined,
  fieldBlockType?: string,
): string | true {
  if (!columnId) return true
  if (!boardId || !cache) return true

  const board = cache.boards.find((b) => b.id === boardId)
  if (!board) return true

  const column = board.columns.find((c) => c.id === columnId)
  if (!column) {
    return `Column id "${columnId}" does not exist on board "${board.name}" — check the columns reference panel and correct it.`
  }

  const compatibleTypes = fieldBlockType ? COMPATIBLE_COLUMN_TYPES[fieldBlockType] : undefined
  if (compatibleTypes && !compatibleTypes.includes(column.type)) {
    return `Column "${column.title}" is a "${column.type}" column on Monday, which a "${fieldBlockType}" field can't sync into cleanly — pick a ${compatibleTypes.join('/')} column instead, or change this field's type.`
  }

  return true
}

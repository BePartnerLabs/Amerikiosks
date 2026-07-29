import type { Payload } from 'payload'
import { GenericMondayRepository, MondayApiError } from '@/repositories/GenericMondayRepository'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'
import { getPrivateFileBuffer } from '@/utilities/privateUpload'

type FormField = { name?: string; externalId?: string; blockType?: string }
type SubmissionDataItem = { field: string; value: unknown }
type AttachmentRow = {
  field?: string | null
  key?: string | null
  filename?: string | null
  mimeType?: string | null
}

// Whichever submitted field carries one of these externalIds becomes the
// Monday item's title (create_item's item_name) instead of a regular
// column; falls back to "<form title> — submission #<id>" when none does.
// `name` is accepted alongside the explicit `item_name` sentinel because
// that is the real column id Monday shows for the title column, so it is
// what an editor naturally copies out of the columns reference panel —
// and it cannot collide with a regular column, since Monday reserves it.
const ITEM_NAME_EXTERNAL_IDS = new Set(['item_name', 'name'])

// Monday's column_values shape depends on the target column's type — a
// plain "text" column rejects the {"text": "..."} wrapper (that's only
// valid for a handful of richer types), so build the value per column type
// from the cached board schema rather than assuming one shape for every
// column. Falls back to a plain string for "text"/"numbers"/unknown types,
// which covers everything except the handful listed here.
function buildColumnValue(type: string | undefined, value: string): unknown {
  switch (type) {
    case 'long_text':
      return { text: value }
    case 'link':
      return { url: value, text: value }
    case 'email':
      return { email: value, text: value }
    case 'phone':
      // Monday requires an ISO country code alongside the number. Every
      // Amerikiosks form is a US kiosk-placement inquiry, so US is a safe
      // default — revisit if a form ever collects an international phone.
      return { phone: value, countryShortName: 'US' }
    default:
      return value
  }
}

function buildColumnValues(
  formFields: FormField[],
  submissionData: SubmissionDataItem[],
  columnTypeById: Map<string, string>,
): {
  itemName: string | undefined
  columnValues: Record<string, unknown>
  rawValueById: Map<string, string>
} {
  const externalIdByFieldName = new Map(
    formFields
      .filter((f) => f.name && f.externalId)
      .map((f) => [f.name as string, f.externalId as string]),
  )

  let itemName: string | undefined
  const columnValues: Record<string, unknown> = {}
  const rawValueById = new Map<string, string>()

  for (const { field, value } of submissionData) {
    const externalId = externalIdByFieldName.get(field)
    if (!externalId) continue
    if (ITEM_NAME_EXTERNAL_IDS.has(externalId)) {
      itemName = String(value)
      continue
    }
    const rawValue = String(value)
    rawValueById.set(externalId, rawValue)
    columnValues[externalId] = buildColumnValue(columnTypeById.get(externalId), rawValue)
  }

  return { itemName, columnValues, rawValueById }
}

// Monday's error_data.column_type is ground truth straight from the live
// board — more reliable than mondayBoardsCache, which is only ever as
// fresh as the last manual sync (Settings -> Monday.com -> Sync boards).
// Rebuild just the columns Monday complained about using their real type,
// so a submission self-heals from cache drift instead of failing outright.
function correctColumnValuesFromError(
  columnValues: Record<string, unknown>,
  rawValueById: Map<string, string>,
  err: MondayApiError,
): Record<string, unknown> | null {
  let corrected: Record<string, unknown> | null = null

  for (const gqlError of err.errors) {
    if (gqlError.extensions?.code !== 'ColumnValueException') continue
    const columnId = gqlError.extensions.error_data?.column_id
    const columnType = gqlError.extensions.error_data?.column_type
    const rawValue = columnId ? rawValueById.get(columnId) : undefined
    if (!columnId || !columnType || rawValue === undefined) continue

    corrected ??= { ...columnValues }
    corrected[columnId] = buildColumnValue(columnType, rawValue)
  }

  return corrected
}

type SubmissionDoc = {
  id: number | string
  form: number | { id: number }
  submissionData?: unknown
  attachments?: unknown
}

/**
 * Pushes a stored submission to its form's configured integration.
 *
 * Deliberately NOT a collection hook. It used to run as `afterChange`, which
 * meant it executed inside the create's transaction: any DB-level error in
 * here aborted that transaction and took the visitor's submission down with
 * it — the lead was lost and the browser got a bare 404 (see the media-id
 * caveat further down, and commit d9fe37e). It also held a Postgres
 * connection open for the duration of an HTTP round-trip to Monday.
 *
 * Callers run it *after* the submission is committed and pass a plain
 * `payload` instance rather than the request's transactional `req`, so a sync
 * failure can no longer reach the stored row. The cost is that a crash
 * between commit and sync leaves the submission on `syncStatus: 'pending'` —
 * which is exactly what the manual resync button in /admin is for.
 */
export async function syncFormSubmission({
  payload,
  doc,
}: {
  payload: Payload
  doc: SubmissionDoc
}): Promise<void> {
  // Belt and braces around everything below. The per-step handling further
  // down records failures on the document, but the very first lookups (the
  // form, the settings global) happen before that machinery exists — and an
  // exception escaping here would reach the caller, which is awaiting this
  // after the submission is already committed. Nothing in this function is
  // allowed to become the visitor's problem.
  try {
    await run(payload, doc)
  } catch (err) {
    payload.logger.error(
      `syncFormSubmission: unrecoverable failure for submission ${doc.id}: ${(err as Error).message}`,
    )
  }
}

async function run(payload: Payload, doc: SubmissionDoc): Promise<void> {
  // `doc.form` is a relationship — it arrives as a plain id when the create
  // request used depth 0, but as the populated Form object when depth > 0
  // (e.g. the default REST depth). Resolve either shape to a numeric id.
  const formId =
    typeof doc.form === 'object' && doc.form !== null
      ? ((doc.form as { id: number }).id as number)
      : (doc.form as number)

  const form = await payload.findByID({
    collection: 'forms',
    id: formId,
    depth: 0,
  })

  const integrationTarget = (form as { integrationTarget?: string }).integrationTarget ?? 'none'
  if (integrationTarget === 'none') return

  const updateStatus = async (data: Record<string, unknown>) =>
    payload.update({
      collection: 'form-submissions',
      id: doc.id,
      data,
    })

  if (integrationTarget !== 'monday') {
    // Odoo not yet implemented — reserved option (see plugin config).
    await updateStatus({
      syncStatus: 'error',
      syncError: `${integrationTarget} integration not yet implemented`,
    })
    return
  }

  try {
    const boardId = (form as { externalId?: string }).externalId
    const groupId = (form as { mondayGroupId?: string }).mondayGroupId
    if (!boardId || !groupId) {
      throw new Error('Form is missing externalId (board id) or mondayGroupId')
    }

    const settings = await payload.findGlobal({ slug: 'settings' })
    const apiToken = settings.mondayApiToken ?? ''

    const boardsCache = settings.mondayBoardsCache as MondayBoardsCache | undefined
    const board = boardsCache?.boards.find((b) => b.id === boardId)
    const columnTypeById = new Map((board?.columns ?? []).map((c) => [c.id, c.type]))

    const formFields = (form.fields ?? []) as FormField[]
    const { itemName, columnValues, rawValueById } = buildColumnValues(
      formFields,
      (doc.submissionData ?? []) as SubmissionDataItem[],
      columnTypeById,
    )

    const resolvedItemName = itemName ?? `${form.title} — submission #${doc.id}`

    let itemId: string
    try {
      ;({ id: itemId } = await GenericMondayRepository.submit(
        boardId,
        groupId,
        resolvedItemName,
        columnValues,
        apiToken,
      ))
    } catch (err) {
      if (!(err instanceof MondayApiError)) throw err

      const corrected = correctColumnValuesFromError(columnValues, rawValueById, err)
      if (!corrected) throw err

      payload.logger.warn(
        `syncFormSubmission: retrying submission ${doc.id} with column types from Monday's own error response (mondayBoardsCache may be stale — consider re-syncing it)`,
      )
      ;({ id: itemId } = await GenericMondayRepository.submit(
        boardId,
        groupId,
        resolvedItemName,
        corrected,
        apiToken,
      ))
    }

    // Attachments live in the private R2 bucket (see the route that writes
    // them); the bytes are pulled server-side with credentials and forwarded
    // to Monday as a real file. There is deliberately no URL involved — the
    // objects have no public access, which is the whole point of storing
    // business documents there instead of in the public `media` collection.
    const externalIdByFieldName = new Map(
      formFields
        .filter((f) => f.name && f.externalId)
        .map((f) => [f.name as string, f.externalId as string]),
    )
    for (const attachment of (doc.attachments ?? []) as AttachmentRow[]) {
      const columnId = attachment.field ? externalIdByFieldName.get(attachment.field) : undefined
      if (!columnId || !attachment.key) continue

      const { buffer, contentType } = await getPrivateFileBuffer(attachment.key)
      await GenericMondayRepository.addFile(
        itemId,
        columnId,
        {
          buffer,
          filename: attachment.filename ?? 'upload',
          contentType: attachment.mimeType ?? contentType,
        },
        apiToken,
      )
    }

    await updateStatus({
      syncStatus: 'synced',
      syncedAt: new Date().toISOString(),
      syncError: null,
    })
  } catch (err) {
    payload.logger.error(
      `syncFormSubmission: failed to sync submission ${doc.id}: ${(err as Error).message}`,
    )
    // Recording the failure is best-effort: the submission is already
    // committed and must survive regardless, so a second failure here is
    // logged and dropped rather than propagated.
    try {
      await updateStatus({ syncStatus: 'error', syncError: (err as Error).message })
    } catch (statusErr) {
      payload.logger.error(
        `syncFormSubmission: could not record sync error on submission ${doc.id}: ${(statusErr as Error).message}`,
      )
    }
  }
}

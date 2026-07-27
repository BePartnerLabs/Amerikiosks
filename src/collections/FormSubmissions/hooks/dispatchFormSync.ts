import type { CollectionAfterChangeHook } from 'payload'
import { GenericMondayRepository } from '@/repositories/GenericMondayRepository'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

type FormField = { name?: string; externalId?: string; blockType?: string }
type SubmissionDataItem = { field: string; value: unknown }
type SubmissionUploadItem = { field: string; value: Array<{ value: number | string }> }

// Special-case externalId value on a field: whichever submitted field is
// tagged this way becomes the Monday item's title (create_item's
// item_name) instead of a regular column. Falls back to
// "<form title> — submission #<id>" when no field uses it.
const ITEM_NAME_EXTERNAL_ID = 'item_name'

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
    default:
      return value
  }
}

function buildColumnValues(
  formFields: FormField[],
  submissionData: SubmissionDataItem[],
  columnTypeById: Map<string, string>,
): { itemName: string | undefined; columnValues: Record<string, unknown> } {
  const externalIdByFieldName = new Map(
    formFields
      .filter((f) => f.name && f.externalId)
      .map((f) => [f.name as string, f.externalId as string]),
  )

  let itemName: string | undefined
  const columnValues: Record<string, unknown> = {}

  for (const { field, value } of submissionData) {
    const externalId = externalIdByFieldName.get(field)
    if (!externalId) continue
    if (externalId === ITEM_NAME_EXTERNAL_ID) {
      itemName = String(value)
      continue
    }
    columnValues[externalId] = buildColumnValue(columnTypeById.get(externalId), String(value))
  }

  return { itemName, columnValues }
}

export const dispatchFormSync: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipFormSync) return doc

  // `doc.form` is a relationship — it arrives as a plain id when the create
  // request used depth 0, but as the populated Form object when depth > 0
  // (e.g. the default REST depth). Resolve either shape to a numeric id.
  const formId =
    typeof doc.form === 'object' && doc.form !== null
      ? ((doc.form as { id: number }).id as number)
      : (doc.form as number)

  const form = await req.payload.findByID({
    collection: 'forms',
    id: formId,
    depth: 0,
    req,
  })

  const integrationTarget = (form as { integrationTarget?: string }).integrationTarget ?? 'none'
  if (integrationTarget === 'none') return doc

  const updateStatus = async (data: Record<string, unknown>) =>
    req.payload.update({
      collection: 'form-submissions',
      id: doc.id,
      data,
      context: { skipFormSync: true },
      req,
    })

  if (integrationTarget !== 'monday') {
    // Odoo not yet implemented — reserved option (see plugin config).
    await updateStatus({
      syncStatus: 'error',
      syncError: `${integrationTarget} integration not yet implemented`,
    })
    return doc
  }

  try {
    const boardId = (form as { externalId?: string }).externalId
    const groupId = (form as { mondayGroupId?: string }).mondayGroupId
    if (!boardId || !groupId) {
      throw new Error('Form is missing externalId (board id) or mondayGroupId')
    }

    const settings = await req.payload.findGlobal({ slug: 'settings', req })
    const apiToken = settings.mondayApiToken ?? ''

    const boardsCache = settings.mondayBoardsCache as MondayBoardsCache | undefined
    const board = boardsCache?.boards.find((b) => b.id === boardId)
    const columnTypeById = new Map((board?.columns ?? []).map((c) => [c.id, c.type]))

    const formFields = (form.fields ?? []) as FormField[]
    const { itemName, columnValues } = buildColumnValues(
      formFields,
      (doc.submissionData ?? []) as SubmissionDataItem[],
      columnTypeById,
    )

    const { id: itemId } = await GenericMondayRepository.submit(
      boardId,
      groupId,
      itemName ?? `${form.title} — submission #${doc.id}`,
      columnValues,
      apiToken,
    )

    // Uploads live in submissionUploads (media relationships), not
    // submissionData — see the plugin's handleUploads.js. Fetch each
    // uploaded media doc's real bytes and attach it to the matching
    // Monday file column, when that upload field has an externalId set.
    const externalIdByFieldName = new Map(
      formFields
        .filter((f) => f.name && f.externalId)
        .map((f) => [f.name as string, f.externalId as string]),
    )
    for (const { field, value } of (doc.submissionUploads ?? []) as SubmissionUploadItem[]) {
      const columnId = externalIdByFieldName.get(field)
      if (!columnId) continue

      for (const { value: mediaId } of value ?? []) {
        const media = await req.payload.findByID({
          collection: 'media',
          id: mediaId,
          depth: 0,
          req,
        })
        if (!media.url) continue

        const res = await fetch(media.url)
        const buffer = Buffer.from(await res.arrayBuffer())
        await GenericMondayRepository.addFile(
          itemId,
          columnId,
          {
            buffer,
            filename: media.filename ?? 'upload',
            contentType: media.mimeType ?? 'application/octet-stream',
          },
          apiToken,
        )
      }
    }

    await updateStatus({
      syncStatus: 'synced',
      syncedAt: new Date().toISOString(),
      syncError: null,
    })
  } catch (err) {
    req.payload.logger.error(
      `dispatchFormSync: failed to sync submission ${doc.id}: ${(err as Error).message}`,
    )
    await updateStatus({ syncStatus: 'error', syncError: (err as Error).message })
  }

  return doc
}

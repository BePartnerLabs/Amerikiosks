import { serverHttpClient } from './clients/ServerHttpClient'
import { isMondayMocked, logMockedMondayCall } from './mondayMock'

const MONDAY_API_URL = 'https://api.monday.com/v2'

export type MondayGraphQLError = {
  message: string
  extensions?: {
    code?: string
    error_data?: {
      column_id?: string
      column_type?: string
      column_name?: string
    }
  }
}

type MondayResponse = {
  data?: Record<string, unknown>
  errors?: MondayGraphQLError[]
}

// Carries the raw, typed error array (not just a stringified message) so
// callers can react to specific failures — e.g. dispatchFormSync retries a
// ColumnValueException using the real column_type Monday reports, since
// the cached board schema it built the value from can drift out of date.
export class MondayApiError extends Error {
  errors: MondayGraphQLError[]

  constructor(errors: MondayGraphQLError[]) {
    super(`GenericMondayRepository: Monday API returned errors: ${JSON.stringify(errors)}`)
    this.name = 'MondayApiError'
    this.errors = errors
  }
}

function assertNoGraphQLErrors(body: MondayResponse): void {
  if (body.errors?.length) {
    throw new MondayApiError(body.errors)
  }
}

/**
 * Posts a generic form submission to a Monday.com board, keyed entirely by
 * data configured on the Form document (see src/plugins/index.ts's
 * formBuilderPlugin.formOverrides) — unlike MondayRepository.ts (Claims'
 * bespoke, hardcoded field mapping), there's no fixed shape here: every
 * field's Monday column id comes from that field's own `externalId`.
 */
export const GenericMondayRepository = {
  async submit(
    boardId: string,
    groupId: string,
    itemName: string,
    columnValues: Record<string, unknown>,
    apiToken: string,
  ): Promise<{ id: string }> {
    if (isMondayMocked) {
      logMockedMondayCall('create_item', { boardId, groupId, itemName, columnValues })
      return { id: `mock-${Date.now()}` }
    }

    // create_labels_if_missing is not optional in practice: a dropdown column
    // rejects any label it does not already know
    // ("The dropdown label 'Retail' does not exist, possible labels are: {}"),
    // and the labels come from options an editor typed in the CMS. Without
    // this, every select mapped to a dropdown column fails until someone
    // mirrors the wording by hand on the board. Verified against the real API
    // on a throwaway board.
    const mutation = `mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues, create_labels_if_missing: true) {
        id
      }
    }`

    const body = await serverHttpClient.post<MondayResponse>(
      MONDAY_API_URL,
      {
        query: mutation,
        variables: {
          boardId,
          groupId,
          itemName,
          columnValues: JSON.stringify(columnValues),
        },
      },
      { Authorization: apiToken },
    )
    assertNoGraphQLErrors(body)

    const id = (body.data?.create_item as { id: string } | undefined)?.id
    if (!id) throw new Error('GenericMondayRepository: create_item did not return an id')

    return { id }
  },

  async addFile(
    itemId: string,
    columnId: string,
    file: { buffer: Buffer; filename: string; contentType: string },
    apiToken: string,
  ): Promise<void> {
    if (isMondayMocked) {
      logMockedMondayCall('add_file_to_column', {
        itemId,
        columnId,
        filename: file.filename,
        contentType: file.contentType,
        bytes: file.buffer.length,
      })
      return
    }

    const query = `mutation ($file: File!) {
      add_file_to_column (item_id: ${itemId}, column_id: "${columnId}", file: $file) {
        id
      }
    }`

    const formData = new FormData()
    formData.append('query', query)
    formData.append(
      'variables[file]',
      new Blob([new Uint8Array(file.buffer)], { type: file.contentType }),
      file.filename,
    )

    const body = await serverHttpClient.postMultipart<MondayResponse>(MONDAY_API_URL, formData, {
      Authorization: apiToken,
    })
    assertNoGraphQLErrors(body)
  },
}

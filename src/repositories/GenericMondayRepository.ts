import { serverHttpClient } from './clients/ServerHttpClient'

const MONDAY_API_URL = 'https://api.monday.com/v2'

type MondayResponse = {
  data?: Record<string, unknown>
  errors?: Array<{ message: string }>
}

function assertNoGraphQLErrors(body: MondayResponse): void {
  if (body.errors?.length) {
    throw new Error(
      `GenericMondayRepository: Monday API returned errors: ${JSON.stringify(body.errors)}`,
    )
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
    const mutation = `mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
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

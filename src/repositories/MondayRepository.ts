import type { PayloadRequest } from 'payload'
import { CLAIM_REASON_LABEL, PAYMENT_METHOD_LABEL } from './claimLabels'
import type { ClaimSubmission } from './claimTypes'
import { serverHttpClient } from './clients/ServerHttpClient'

export const MONDAY_BOARD_ID = 4498706759
export const MONDAY_GROUP_ID = 'topics'

const MONDAY_API_URL = 'https://api.monday.com/v2'

type MondayResponse = {
  data?: Record<string, unknown>
  errors?: Array<{ message: string }>
}

function assertNoGraphQLErrors(body: MondayResponse): void {
  if (body.errors?.length) {
    throw new Error(`MondayRepository: Monday API returned errors: ${JSON.stringify(body.errors)}`)
  }
}

function formatTransactionTime(transactionDateTime: string): string {
  const date = new Date(transactionDateTime)
  const hour24 = date.getHours()
  const hour12 = ((hour24 + 11) % 12) + 1
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hour12}:${minutes} ${hour24 < 12 ? 'AM' : 'PM'}`
}

// Monday's `phone` column rejects any formatting characters — "(569)
// 403-0359" throws a ColumnValueException, only raw digits are accepted.
const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '')

function buildAdditionalInfo(claim: ClaimSubmission): string {
  const lines = [
    claim.additionalInfo,
    `Transaction time: ${formatTransactionTime(claim.transactionDateTime)}`,
    claim.refundMethod ? `Refund method: ${claim.refundMethod}` : undefined,
    claim.refundAccount ? `Refund account: ${claim.refundAccount}` : undefined,
  ]
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

function buildColumnValues(claim: ClaimSubmission): Record<string, unknown> {
  const columnValues: Record<string, unknown> = {
    text7: `${claim.customerFirstName} ${claim.customerLastName}`.trim(),
    // Monday's `dropdown` column type takes an array of labels/ids, not a
    // singular `label` string (that shape is for `status` columns) — sending
    // { label: "..." } here throws a ColumnValueException at submit time.
    dropdown: { labels: [PAYMENT_METHOD_LABEL[claim.paymentMethod] ?? claim.paymentMethod] },
    email: { email: claim.customerEmail, text: claim.customerEmail },
    phone: { phone: digitsOnly(claim.customerPhone), countryShortName: 'US' },
    date4: { date: new Date(claim.transactionDateTime).toISOString().slice(0, 10) },
    dropdown0: { labels: [CLAIM_REASON_LABEL[claim.claimReason] ?? claim.claimReason] },
    long_text6: { text: buildAdditionalInfo(claim) },
    numbers3: claim.lastFourCardDigits ?? '',
    text__1: claim.kioskBrand,
    text9: claim.location,
    // "Ammount" (numbers1) has no equivalent in our claim model — left
    // unset for the Monday board operator to fill in manually.
  }

  // "Kiosk ID" (text_mkve20y8) — only set when the claim actually has one;
  // not every claim originates from a QR scan.
  if (claim.machineId) {
    columnValues.text_mkve20y8 = claim.machineId
  }

  return columnValues
}

async function addFileToColumn(
  itemId: string,
  photo: NonNullable<ClaimSubmission['photo']>,
  apiToken: string,
): Promise<void> {
  const query = `mutation ($file: File!) {
    add_file_to_column (item_id: ${itemId}, column_id: "files3", file: $file) {
      id
    }
  }`

  const formData = new FormData()
  formData.append('query', query)
  formData.append(
    'variables[file]',
    new Blob([new Uint8Array(photo.buffer)], { type: photo.contentType }),
    photo.filename,
  )

  const body = await serverHttpClient.postMultipart<MondayResponse>(MONDAY_API_URL, formData, {
    Authorization: apiToken,
  })
  assertNoGraphQLErrors(body)
}

export const MondayRepository = {
  async submit(
    claim: ClaimSubmission,
    req: PayloadRequest,
  ): Promise<{ responseCode: number; message: string }> {
    // Local API call — overrideAccess defaults to true, so this reads the token
    // regardless of the field's own access.read: authenticatedFieldAccess
    // restriction (that gate is for external REST/GraphQL requests only).
    const settings = await req.payload.findGlobal({ slug: 'settings', req })
    const apiToken = settings.mondayApiToken ?? ''

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
          boardId: MONDAY_BOARD_ID,
          groupId: MONDAY_GROUP_ID,
          itemName: `${claim.customerFirstName} ${claim.customerLastName}`.trim(),
          columnValues: JSON.stringify(buildColumnValues(claim)),
        },
      },
      { Authorization: apiToken },
    )
    assertNoGraphQLErrors(body)

    if (claim.photo) {
      const itemId = (body.data?.create_item as { id: string } | undefined)?.id
      if (itemId) {
        await addFileToColumn(itemId, claim.photo, apiToken)
      }
    }

    return { responseCode: 200, message: 'success' }
  },
}

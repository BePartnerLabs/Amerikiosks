import type { PayloadRequest } from 'payload'
import { CLAIM_REASON_LABEL, PAYMENT_METHOD_LABEL } from './claimLabels'
import { serverHttpClient } from './clients/ServerHttpClient'
import type { ClaimSubmission } from './JotFormRepository'

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
  return {
    text7: `${claim.customerFirstName} ${claim.customerLastName}`.trim(),
    dropdown: { label: PAYMENT_METHOD_LABEL[claim.paymentMethod] ?? claim.paymentMethod },
    email: { email: claim.customerEmail, text: claim.customerEmail },
    phone: { phone: claim.customerPhone, countryShortName: 'US' },
    date4: { date: new Date(claim.transactionDateTime).toISOString().slice(0, 10) },
    dropdown0: { label: CLAIM_REASON_LABEL[claim.claimReason] ?? claim.claimReason },
    long_text6: { text: buildAdditionalInfo(claim) },
    numbers3: claim.lastFourCardDigits ?? '',
    text__1: claim.kioskBrand,
    text9: claim.location,
    numbers1: claim.amount != null ? String(claim.amount) : '',
  }
}

export const MondayRepository = {
  async submit(
    claim: ClaimSubmission,
    req: PayloadRequest,
  ): Promise<{ responseCode: number; message: string }> {
    // Local API call — overrideAccess defaults to true, so this reads the token
    // regardless of the field's own access.read: authenticatedFieldAccess
    // restriction (same pattern as JotFormRepository reading jotformApiKey).
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

    return { responseCode: 200, message: 'success' }
  },
}

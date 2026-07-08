import { serverHttpClient } from './clients/ServerHttpClient'

export type ClaimSubmission = {
  kioskBrand: string
  paymentMethod: string
  customerName: string
  customerEmail: string
  customerPhone: string
  transactionDateTime: string
  location: { state: string; city: string; propertyName: string }
  claimReason: string
  additionalInfo?: string
  lastFourCardDigits?: string
}

// Amerikiosks' existing "Amerikiosks - Refund Request" JotForm, audited at
// https://form.jotform.com/form/230405763622148 (11 fields, see docs/analytics-migration-report.md).
const JOTFORM_FORM_ID = '230405763622148'

// TODO(pending sign-off, see plan "Pendientes explícitos" #1): these question IDs
// are placeholders — the real submission[<qid>] keys must be confirmed against
// JotForm's form definition (GET /form/{id}/questions) before this repository is
// used against the live form in production.
const QUESTION_ID = {
  kioskBrand: '24',
  paymentMethod: '10',
  customerName: '3',
  customerEmail: '4',
  customerPhone: '5',
  transactionDateTime: '6',
  location: '9',
  claimReason: '7',
  additionalInfo: '8',
  lastFourCardDigits: '11',
} as const

function toJotFormBody(claim: ClaimSubmission): Record<string, string> {
  const location = `${claim.location.state}, ${claim.location.city}, ${claim.location.propertyName}`
  return {
    [`submission[${QUESTION_ID.kioskBrand}]`]: claim.kioskBrand,
    [`submission[${QUESTION_ID.paymentMethod}]`]: claim.paymentMethod,
    [`submission[${QUESTION_ID.customerName}]`]: claim.customerName,
    [`submission[${QUESTION_ID.customerEmail}]`]: claim.customerEmail,
    [`submission[${QUESTION_ID.customerPhone}]`]: claim.customerPhone,
    [`submission[${QUESTION_ID.transactionDateTime}]`]: claim.transactionDateTime,
    [`submission[${QUESTION_ID.location}]`]: location,
    [`submission[${QUESTION_ID.claimReason}]`]: claim.claimReason,
    [`submission[${QUESTION_ID.additionalInfo}]`]: claim.additionalInfo ?? '',
    [`submission[${QUESTION_ID.lastFourCardDigits}]`]: claim.lastFourCardDigits ?? '',
  }
}

export const JotFormRepository = {
  async submit(claim: ClaimSubmission): Promise<{ responseCode: number; message: string }> {
    const url = `https://api.jotform.com/form/${JOTFORM_FORM_ID}/submissions?apiKey=${process.env.JOTFORM_API_KEY}`
    return serverHttpClient.post(url, toJotFormBody(claim), {})
  },
}

import type { PayloadRequest } from 'payload'
import { CLAIM_REASON_LABEL, PAYMENT_METHOD_LABEL } from './claimLabels'
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
  refundMethod?: string
  refundAccount?: string
  amount?: number
  photo?: { buffer: Buffer; filename: string; contentType: string }
}

// Amerikiosks' existing "Amerikiosks - Refund Request" JotForm, audited at
// https://form.jotform.com/form/230405763622148 (see docs/analytics-migration-report.md).
const JOTFORM_FORM_ID = '230405763622148'

// Verified 2026-07-20 directly against the live form's HTML (no API key available
// yet) — every qid and its field structure (simple vs. compound) was confirmed by
// inspecting the real `name="q<id>_..."` attributes and <option> values, not
// guessed. Kept for the eventual official cross-check once JOTFORM_API_KEY is set:
// `GET https://api.jotform.com/form/230405763622148/questions?apiKey=...`
const QUESTION_ID = {
  kioskBrand: '24',
  paymentMethod: '10',
  // "Name" is JotForm's compound Full Name field type — submits as
  // submission[3_first] / submission[3_last], never a single submission[3].
  customerNameFirst: '3_first',
  customerNameLast: '3_last',
  customerEmail: '4',
  // "Phone Number" is a compound Phone field — submission[5_full], not submission[5].
  customerPhone: '5_full',
  // "Date and Time of the transaction" is a compound date/time field —
  // submission[6_month|day|year|hour|min|ampm], never a single submission[6].
  transactionDate: {
    month: '6_month',
    day: '6_day',
    year: '6_year',
    hour: '6_hour',
    min: '6_min',
    ampm: '6_ampm',
  },
  location: '9',
  claimReason: '7',
  additionalInfo: '8',
  lastFourCardDigits: '11',
  refundMethod: '20',
  refundAccount: '21',
  photo: '12',
} as const

// JotForm dropdown/radio questions store their exact option text as the submitted
// value — our Payload `select` fields store short internal slugs instead (cleaner
// for our own admin/DB), so every slug needs mapping to the literal JotForm option
// string before submission. Verified against the live form's <option>/<input value>
// attributes, including JotForm's own trailing periods on claimReason.
// (PAYMENT_METHOD_LABEL / CLAIM_REASON_LABEL live in ./claimLabels — shared with
// MondayRepository so the two integrations' option sets can't drift apart.)

// refundMethod values already match JotForm's option text verbatim (Zelle, CashApp,
// Paypal, Venmo) since that select was added specifically to mirror qid 20 — no
// mapping needed, unlike paymentMethod/claimReason above.

function splitName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim()
  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) return { first: trimmed, last: '' }
  return { first: trimmed.slice(0, spaceIndex), last: trimmed.slice(spaceIndex + 1) }
}

function toJotFormFields(claim: ClaimSubmission): Record<string, string> {
  const location = `${claim.location.state}, ${claim.location.city}, ${claim.location.propertyName}`
  const { first, last } = splitName(claim.customerName)
  const date = new Date(claim.transactionDateTime)
  const hour24 = date.getHours()
  const hour12 = ((hour24 + 11) % 12) + 1

  const fields: Record<string, string> = {
    [`submission[${QUESTION_ID.kioskBrand}]`]: claim.kioskBrand,
    [`submission[${QUESTION_ID.paymentMethod}]`]:
      PAYMENT_METHOD_LABEL[claim.paymentMethod] ?? claim.paymentMethod,
    [`submission[${QUESTION_ID.customerNameFirst}]`]: first,
    [`submission[${QUESTION_ID.customerNameLast}]`]: last,
    [`submission[${QUESTION_ID.customerEmail}]`]: claim.customerEmail,
    [`submission[${QUESTION_ID.customerPhone}]`]: claim.customerPhone,
    [`submission[${QUESTION_ID.transactionDate.month}]`]: String(date.getMonth() + 1),
    [`submission[${QUESTION_ID.transactionDate.day}]`]: String(date.getDate()),
    [`submission[${QUESTION_ID.transactionDate.year}]`]: String(date.getFullYear()),
    [`submission[${QUESTION_ID.transactionDate.hour}]`]: String(hour12),
    [`submission[${QUESTION_ID.transactionDate.min}]`]: String(date.getMinutes()).padStart(2, '0'),
    [`submission[${QUESTION_ID.transactionDate.ampm}]`]: hour24 < 12 ? 'AM' : 'PM',
    [`submission[${QUESTION_ID.location}]`]: location,
    [`submission[${QUESTION_ID.claimReason}]`]:
      CLAIM_REASON_LABEL[claim.claimReason] ?? claim.claimReason,
    [`submission[${QUESTION_ID.additionalInfo}]`]: claim.additionalInfo ?? '',
    [`submission[${QUESTION_ID.lastFourCardDigits}]`]: claim.lastFourCardDigits ?? '',
  }

  if (claim.refundMethod) {
    fields[`submission[${QUESTION_ID.refundMethod}]`] = claim.refundMethod
  }
  if (claim.refundAccount) {
    fields[`submission[${QUESTION_ID.refundAccount}]`] = claim.refundAccount
  }

  return fields
}

export const JotFormRepository = {
  async submit(
    claim: ClaimSubmission,
    req: PayloadRequest,
  ): Promise<{ responseCode: number; message: string }> {
    // Local API call — overrideAccess defaults to true, so this reads the key
    // regardless of the field's own access.read: authenticatedFieldAccess
    // restriction (that gate is for external REST/GraphQL requests only, see
    // src/Settings/config.ts).
    const settings = await req.payload.findGlobal({ slug: 'settings', req })
    const apiKey = settings.jotformApiKey

    // APIKEY header instead of the ?apiKey= query param — JotForm supports
    // both, but the header keeps the key out of server access logs, proxy
    // logs, and any URL that gets cached or forwarded.
    const url = `https://api.jotform.com/form/${JOTFORM_FORM_ID}/submissions`
    const headers = { APIKEY: apiKey ?? '' }
    const fields = toJotFormFields(claim)

    if (claim.photo) {
      const formData = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value)
      }
      formData.append(
        `submission[${QUESTION_ID.photo}]`,
        new Blob([new Uint8Array(claim.photo.buffer)], { type: claim.photo.contentType }),
        claim.photo.filename,
      )
      return serverHttpClient.postMultipart(url, formData, headers)
    }

    return serverHttpClient.postForm(url, fields, headers)
  },
}

import type { PayloadRequest } from 'payload'
import { serverHttpClient } from './clients/ServerHttpClient'

export type ClaimSubmission = {
  kioskBrand: string
  paymentMethod: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  transactionDateTime: string
  location: string
  claimReason: string
  additionalInfo?: string
  lastFourCardDigits?: string
  refundMethod?: string
  refundAccount?: string
  // No photo field here on purpose — JotForm's public Submissions REST API
  // (this repository's endpoint) cannot attach a real file: tried multipart,
  // a plain URL, and a base64 data URI, all confirmed empirically against
  // JotForm's live API to leave the file-upload answer empty or store the
  // raw string as a garbage filename, never the actual image. Real file
  // delivery only works through JotForm's internal, undocumented
  // upload.jotform.com + submit.jotform.com widget protocol, which this
  // project deliberately does not replicate (see Claims.photoKey instead —
  // the photo lives in our own private R2 bucket, viewed on demand via
  // GET /api/claims/:id/photo-url, not delivered into JotForm at all).
}

// Amerikiosks' existing "Amerikiosks - Refund Request" JotForm, audited at
// https://form.jotform.com/form/230405763622148 (see docs/analytics-migration-report.md).
// Overridable via Settings.jotformFormId (e.g. to point at a clone/test form
// locally) — see src/Settings/config.ts.
const DEFAULT_JOTFORM_FORM_ID = '230405763622148'

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
} as const

// JotForm dropdown/radio questions store their exact option text as the submitted
// value — our Payload `select` fields store short internal slugs instead (cleaner
// for our own admin/DB), so every slug needs mapping to the literal JotForm option
// string before submission. Verified against the live form's <option>/<input value>
// attributes, including JotForm's own trailing periods on claimReason.
const PAYMENT_METHOD_LABEL: Record<string, string> = {
  card: 'Credit/Debit Card',
  cash: 'Cash',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
}

const CLAIM_REASON_LABEL: Record<string, string> = {
  partial_dispense: 'Only part of my order was dispensed.',
  damaged_product: 'The product was damaged.',
  wrong_product: 'I received the wrong product.',
  no_product: "I didn't receive my product.",
}

// refundMethod values already match JotForm's option text verbatim (Zelle, CashApp,
// Paypal, Venmo) since that select was added specifically to mirror qid 20 — no
// mapping needed, unlike paymentMethod/claimReason above.

function toJotFormFields(claim: ClaimSubmission): Record<string, string> {
  const date = new Date(claim.transactionDateTime)
  const hour24 = date.getHours()
  const hour12 = ((hour24 + 11) % 12) + 1

  const fields: Record<string, string> = {
    [`submission[${QUESTION_ID.kioskBrand}]`]: claim.kioskBrand,
    [`submission[${QUESTION_ID.paymentMethod}]`]:
      PAYMENT_METHOD_LABEL[claim.paymentMethod] ?? claim.paymentMethod,
    [`submission[${QUESTION_ID.customerNameFirst}]`]: claim.customerFirstName,
    [`submission[${QUESTION_ID.customerNameLast}]`]: claim.customerLastName,
    [`submission[${QUESTION_ID.customerEmail}]`]: claim.customerEmail,
    [`submission[${QUESTION_ID.customerPhone}]`]: claim.customerPhone,
    [`submission[${QUESTION_ID.transactionDate.month}]`]: String(date.getMonth() + 1),
    [`submission[${QUESTION_ID.transactionDate.day}]`]: String(date.getDate()),
    [`submission[${QUESTION_ID.transactionDate.year}]`]: String(date.getFullYear()),
    [`submission[${QUESTION_ID.transactionDate.hour}]`]: String(hour12),
    [`submission[${QUESTION_ID.transactionDate.min}]`]: String(date.getMinutes()).padStart(2, '0'),
    [`submission[${QUESTION_ID.transactionDate.ampm}]`]: hour24 < 12 ? 'AM' : 'PM',
    [`submission[${QUESTION_ID.location}]`]: claim.location,
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
    const formId = settings.jotformFormId || DEFAULT_JOTFORM_FORM_ID

    // APIKEY header instead of the ?apiKey= query param — JotForm supports
    // both, but the header keeps the key out of server access logs, proxy
    // logs, and any URL that gets cached or forwarded.
    const url = `https://api.jotform.com/form/${formId}/submissions`
    const headers = { APIKEY: apiKey ?? '' }
    const fields = toJotFormFields(claim)

    return serverHttpClient.postForm(url, fields, headers)
  },
}

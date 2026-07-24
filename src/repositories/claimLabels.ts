// Shared between JotFormRepository and MondayRepository — our Payload `select`
// fields store short internal slugs, but both external systems' dropdown
// options expect the human-readable label text. Kept in one place so the two
// integrations' option sets can't drift out of sync with each other.
export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  card: 'Credit/Debit Card',
  cash: 'Cash',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
}

export const CLAIM_REASON_LABEL: Record<string, string> = {
  partial_dispense: 'Only part of my order was dispensed.',
  damaged_product: 'The product was damaged.',
  wrong_product: 'I received the wrong product.',
  no_product: "I didn't receive my product.",
}

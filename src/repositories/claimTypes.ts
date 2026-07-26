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
  // Captured from the QR code scan (Claims.machineId) — only Monday maps
  // this (to the "Kiosk ID" column) when present.
  machineId?: string
  // Populated only when routing to Monday (see dispatchClaimSync.ts) — its
  // GraphQL API can attach a real file via add_file_to_column.
  photo?: { buffer: Buffer; filename: string; contentType: string }
}

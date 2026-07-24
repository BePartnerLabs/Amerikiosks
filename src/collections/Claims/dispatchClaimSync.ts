import type { PayloadRequest } from 'payload'
import type { Claim } from '@/payload-types'
import { JotFormRepository, MondayRepository, OdooRepository } from '@/repositories'
import type { ClaimSubmission } from '@/repositories/JotFormRepository'
import { getPrivateFileBuffer } from '@/utilities/privateUpload'

const REPOSITORIES = {
  jotform: JotFormRepository,
  odoo: OdooRepository,
  monday: MondayRepository,
} as const

// Called from syncClaimTask.ts (the queued job every claim goes through —
// see syncClaim.ts).
export async function dispatchClaimSync(claim: Claim, req: PayloadRequest): Promise<void> {
  // kioskBrand is a relationship — JotForm's radio question needs the brand's
  // display name ("Carlo's Bakery"), not the Brands doc's row id.
  const kioskBrandId =
    typeof claim.kioskBrand === 'object' && claim.kioskBrand !== null
      ? claim.kioskBrand.id
      : claim.kioskBrand
  const brand = await req.payload.findByID({
    collection: 'brands',
    id: kioskBrandId,
    depth: 0,
    req,
  })

  // The raw R2 object key isn't useful to staff (it's meaningless outside
  // our own bucket credentials), so instead of sending it we append a
  // human-readable pointer to Additional Information — staff can look up
  // the claim by id in our own /admin and view the photo via the
  // authenticated GET /api/claims/:id/photo-url endpoint.
  const additionalInfo = claim.photoKey
    ? `${claim.additionalInfo ?? ''}\n\n[Photo attached — view in admin: Claim #${claim.id}]`.trim()
    : (claim.additionalInfo ?? undefined)

  const repository =
    REPOSITORIES[claim.integrationTarget as keyof typeof REPOSITORIES] ?? JotFormRepository

  // Only Monday's API can actually receive the real file (see
  // ClaimSubmission.photo) — fetching it from R2 for the other targets
  // would be wasted work, since they only get the text pointer below.
  const photo =
    repository === MondayRepository && claim.photoKey
      ? await getPrivateFileBuffer(claim.photoKey).then(({ buffer, contentType }) => ({
          buffer,
          contentType,
          filename: claim.photoKey ?? 'photo',
        }))
      : undefined

  const submission: ClaimSubmission = {
    kioskBrand: brand.name,
    paymentMethod: claim.paymentMethod,
    customerFirstName: claim.customerFirstName,
    customerLastName: claim.customerLastName,
    customerEmail: claim.customerEmail,
    customerPhone: claim.customerPhone,
    transactionDateTime: claim.transactionDateTime,
    location: claim.location,
    claimReason: claim.claimReason,
    additionalInfo,
    lastFourCardDigits: claim.lastFourCardDigits ?? undefined,
    refundMethod: claim.refundMethod ?? undefined,
    refundAccount: claim.refundAccount ?? undefined,
    machineId: claim.machineId ?? undefined,
    photo,
  }

  try {
    await repository.submit(submission, req)
    await req.payload.update({
      collection: 'claims',
      id: claim.id,
      data: { syncStatus: 'synced', syncedAt: new Date().toISOString(), syncError: null },
      context: { skipClaimsSync: true },
      req,
    })
  } catch (err) {
    req.payload.logger.error(
      `dispatchClaimSync: failed to sync claim ${claim.id}: ${(err as Error).message}`,
    )
    await req.payload.update({
      collection: 'claims',
      id: claim.id,
      data: { syncStatus: 'error', syncError: (err as Error).message },
      context: { skipClaimsSync: true },
      req,
    })
  }
}

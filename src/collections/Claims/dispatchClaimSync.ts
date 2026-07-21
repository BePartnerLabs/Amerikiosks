import type { PayloadRequest } from 'payload'
import type { Claim } from '@/payload-types'
import { JotFormRepository, OdooRepository } from '@/repositories'
import type { ClaimSubmission } from '@/repositories/JotFormRepository'

type PhotoContext = { buffer: Buffer; filename: string; contentType: string }

// Shared by both dispatch paths: syncClaim.ts (synchronous — used only when a
// photo is present, since the photo only exists in-memory for the original
// request) and syncClaimTask.ts (queued job — used for the common no-photo
// case, so the user isn't stuck waiting on JotForm's round trip).
export async function dispatchClaimSync(
  claim: Claim,
  req: PayloadRequest,
  photo?: PhotoContext,
): Promise<void> {
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

  const submission: ClaimSubmission = {
    kioskBrand: brand.name,
    paymentMethod: claim.paymentMethod,
    customerName: claim.customerName,
    customerEmail: claim.customerEmail,
    customerPhone: claim.customerPhone,
    transactionDateTime: claim.transactionDateTime,
    location: claim.location,
    claimReason: claim.claimReason,
    additionalInfo: claim.additionalInfo ?? undefined,
    lastFourCardDigits: claim.lastFourCardDigits ?? undefined,
    refundMethod: claim.refundMethod ?? undefined,
    refundAccount: claim.refundAccount ?? undefined,
    photo,
  }

  const repository = claim.integrationTarget === 'odoo' ? OdooRepository : JotFormRepository

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

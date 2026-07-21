import type { CollectionAfterChangeHook } from 'payload'
import type { Claim } from '@/payload-types'
import { JotFormRepository, OdooRepository } from '@/repositories'
import type { ClaimSubmission } from '@/repositories/JotFormRepository'

type PhotoContext = { buffer: Buffer; filename: string; contentType: string }

/**
 * Dispatches a newly created claim to the configured integration target
 * (JotForm today, Odoo once its REST API is ready — see Phase B) and records
 * the outcome on the same doc. Uses the same `context.<flag>` recursion guard
 * as `revalidatePage.ts`'s `context.disableRevalidate`.
 */
export const syncClaim: CollectionAfterChangeHook<Claim> = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipClaimsSync) {
    return doc
  }

  // kioskBrand is stored as a relationship — JotForm's radio question needs the
  // brand's display name ("Carlo's Bakery"), not the Brands doc's row id.
  const kioskBrandId =
    typeof doc.kioskBrand === 'object' && doc.kioskBrand !== null
      ? doc.kioskBrand.id
      : doc.kioskBrand
  const brand = await req.payload.findByID({
    collection: 'brands',
    id: kioskBrandId,
    depth: 0,
    req,
  })

  // The photo, when present, only ever exists in memory for this one request —
  // next/claims-submit/route.ts stashes it on req.context before calling
  // payload.create(), since it's deliberately never written to the Claims.photo
  // field or Payload Media for public submissions (see that field's admin
  // description for why). Not available on subsequent requests/updates.
  const photo = req.context?.photoFile as PhotoContext | undefined

  const submission: ClaimSubmission = {
    kioskBrand: brand.name,
    paymentMethod: doc.paymentMethod,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerPhone: doc.customerPhone,
    transactionDateTime: doc.transactionDateTime,
    location: doc.location,
    claimReason: doc.claimReason,
    additionalInfo: doc.additionalInfo ?? undefined,
    lastFourCardDigits: doc.lastFourCardDigits ?? undefined,
    refundMethod: doc.refundMethod ?? undefined,
    refundAccount: doc.refundAccount ?? undefined,
    photo,
  }

  const repository = doc.integrationTarget === 'odoo' ? OdooRepository : JotFormRepository

  try {
    await repository.submit(submission)
    await req.payload.update({
      collection: 'claims',
      id: doc.id,
      data: { syncStatus: 'synced', syncedAt: new Date().toISOString(), syncError: null },
      context: { skipClaimsSync: true },
      req,
    })
  } catch (err) {
    req.payload.logger.error(`syncClaim: failed to sync claim ${doc.id}: ${(err as Error).message}`)
    await req.payload.update({
      collection: 'claims',
      id: doc.id,
      data: { syncStatus: 'error', syncError: (err as Error).message },
      context: { skipClaimsSync: true },
      req,
    })
  }

  return doc
}

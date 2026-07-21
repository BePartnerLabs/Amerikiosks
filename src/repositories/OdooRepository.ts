import type { PayloadRequest } from 'payload'
import type { ClaimSubmission } from './JotFormRepository'

/**
 * Phase B — stubbed until Amerikiosks' Odoo REST API spec is available.
 * Kept in the same shape as JotFormRepository so `syncClaim` can dispatch to
 * either one via a config toggle without a rewrite when Odoo is ready.
 */
export const OdooRepository = {
  async submit(_claim: ClaimSubmission, _req: PayloadRequest): Promise<never> {
    throw new Error('OdooRepository.submit: Odoo integration not yet implemented (Phase B)')
  },
}

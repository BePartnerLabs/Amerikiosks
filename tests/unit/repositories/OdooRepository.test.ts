import { describe, expect, it } from 'vitest'
import type { ClaimSubmission } from '@/repositories/claimTypes'
import { OdooRepository } from '@/repositories/OdooRepository'

const baseClaim: ClaimSubmission = {
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerFirstName: 'Test',
  customerLastName: 'Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: 'BePartnerLabs Test Property, Doral, FL',
  claimReason: 'partial_dispense',
}

describe('OdooRepository (Phase B stub)', () => {
  it('rejects clearly until the Odoo REST API integration is implemented', async () => {
    await expect(OdooRepository.submit(baseClaim, {} as never)).rejects.toThrow(
      /Odoo.*not yet implemented|Phase B/i,
    )
  })
})

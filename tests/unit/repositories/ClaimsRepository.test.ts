import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClaimFormData } from '@/repositories/ClaimsRepository'
import { ClaimsRepository } from '@/repositories/ClaimsRepository'

describe('ClaimsRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the claim to the /next/claims-submit endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 'claim-1' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })

    const data: ClaimFormData = {
      kioskBrand: 'brand-1',
      paymentMethod: 'card',
      customerName: 'Test Prueba',
      customerEmail: 'hola@bepartnerlabs.com',
      customerPhone: '3055550100',
      transactionDateTime: '2026-07-08T09:23:00.000Z',
      location: { state: 'FL', city: 'Doral', propertyName: 'BePartnerLabs Test Property' },
      claimReason: 'partial_dispense',
      machineId: 'AK-0231',
    }

    const result = await ClaimsRepository.submit(data)

    expect(result).toEqual({ id: 'claim-1' })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/next/claims-submit')
    expect(JSON.parse(options.body)).toMatchObject({ machineId: 'AK-0231' })
  })
})

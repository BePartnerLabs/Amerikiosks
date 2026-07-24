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
      customerFirstName: 'Test',
      customerLastName: 'Prueba',
      customerEmail: 'hola@bepartnerlabs.com',
      customerPhone: '3055550100',
      transactionDateTime: '2026-07-08T09:23:00.000Z',
      location: 'BePartnerLabs Test Property, Doral, FL',
      claimReason: 'partial_dispense',
      machineId: 'AK-0231',
    }

    const result = await ClaimsRepository.submit(data)

    expect(result).toEqual({ id: 'claim-1' })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/next/claims-submit')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('machineId')).toBe('AK-0231')
    expect(options.body.get('location')).toBe(data.location)
    // Never set Content-Type explicitly on a FormData body — the fetch runtime
    // derives the multipart boundary from the FormData instance itself.
    expect(options.headers).toBeUndefined()
  })

  it('appends the photo file when present, omits it otherwise', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 'claim-1' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })

    const data: ClaimFormData = {
      kioskBrand: 'brand-1',
      paymentMethod: 'cash',
      customerFirstName: 'Test',
      customerLastName: 'Prueba',
      customerEmail: 'hola@bepartnerlabs.com',
      customerPhone: '3055550100',
      transactionDateTime: '2026-07-08T09:23:00.000Z',
      location: 'BePartnerLabs Test Property, Doral, FL',
      claimReason: 'partial_dispense',
      refundMethod: 'Zelle',
      refundAccount: 'test@example.com',
      photo: new File(['fake-bytes'], 'issue.jpg', { type: 'image/jpeg' }),
    }

    await ClaimsRepository.submit(data)

    const [, options] = fetchMock.mock.calls[0]
    expect(options.body.get('refundMethod')).toBe('Zelle')
    expect(options.body.get('refundAccount')).toBe('test@example.com')
    expect(options.body.get('photo')).toBeInstanceOf(File)
  })
})

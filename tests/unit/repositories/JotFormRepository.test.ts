import { afterEach, describe, expect, it, vi } from 'vitest'

const postMock = vi.fn()

vi.mock('@/repositories/clients/ServerHttpClient', () => ({
  serverHttpClient: { post: postMock },
}))

const baseClaim = {
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerName: 'Test Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: { state: 'FL', city: 'Doral', propertyName: 'BePartnerLabs Test Property' },
  claimReason: 'partial_dispense',
  additionalInfo: 'Test note',
  lastFourCardDigits: '0000',
} as const

describe('JotFormRepository', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('submits to the JotForm submissions API for the configured form ID, with the API key', async () => {
    vi.stubEnv('JOTFORM_API_KEY', 'test-key')
    postMock.mockResolvedValue({ responseCode: 200, message: 'success' })

    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining('api.jotform.com/form/230405763622148/submissions'),
      expect.any(Object),
      expect.objectContaining({}),
    )
    const [url] = postMock.mock.calls[0]
    expect(url).toContain('apiKey=test-key')
  })

  it('propagates an error when the underlying HTTP call fails, so the sync hook can record it', async () => {
    vi.stubEnv('JOTFORM_API_KEY', 'test-key')
    postMock.mockRejectedValue(new Error('ServerHttpClient: POST ... failed with 500'))

    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await expect(JotFormRepository.submit(baseClaim)).rejects.toThrow('failed with 500')
  })
})

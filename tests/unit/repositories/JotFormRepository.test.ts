import { afterEach, describe, expect, it, vi } from 'vitest'

const postFormMock = vi.fn()
const postMultipartMock = vi.fn()

vi.mock('@/repositories/clients/ServerHttpClient', () => ({
  serverHttpClient: { postForm: postFormMock, postMultipart: postMultipartMock },
}))

const baseClaim = {
  kioskBrand: "Carlo's Bakery",
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

  it('submits form-urlencoded to the JotForm submissions API for the configured form ID, with the API key', async () => {
    vi.stubEnv('JOTFORM_API_KEY', 'test-key')
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })

    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    expect(postFormMock).toHaveBeenCalledWith(
      expect.stringContaining('api.jotform.com/form/230405763622148/submissions'),
      expect.any(Object),
    )
    const [url] = postFormMock.mock.calls[0]
    expect(url).toContain('apiKey=test-key')
  })

  it('splits the compound Name field into submission[3_first] / submission[3_last]', async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    const [, fields] = postFormMock.mock.calls[0]
    expect(fields['submission[3_first]']).toBe('Test')
    expect(fields['submission[3_last]']).toBe('Prueba')
    expect(fields['submission[3]']).toBeUndefined()
  })

  it('sends the compound Phone field as submission[5_full], not submission[5]', async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    const [, fields] = postFormMock.mock.calls[0]
    expect(fields['submission[5_full]']).toBe('3055550100')
    expect(fields['submission[5]']).toBeUndefined()
  })

  it('splits the compound date/time field into month/day/year/hour/min/ampm', async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    // 2026-07-08T09:23:00.000Z parsed with the local Date constructor — assert against
    // the same Date the repository builds internally, not a hardcoded local time.
    const date = new Date(baseClaim.transactionDateTime)
    await JotFormRepository.submit(baseClaim)

    const [, fields] = postFormMock.mock.calls[0]
    expect(fields['submission[6_month]']).toBe(String(date.getMonth() + 1))
    expect(fields['submission[6_day]']).toBe(String(date.getDate()))
    expect(fields['submission[6_year]']).toBe(String(date.getFullYear()))
    expect(fields['submission[6]']).toBeUndefined()
  })

  it("maps the internal paymentMethod slug to JotForm's exact option text", async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    const [, fields] = postFormMock.mock.calls[0]
    expect(fields['submission[10]']).toBe('Credit/Debit Card')
  })

  it("maps the internal claimReason slug to JotForm's exact option text (with trailing period)", async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await JotFormRepository.submit(baseClaim)

    const [, fields] = postFormMock.mock.calls[0]
    expect(fields['submission[7]']).toBe('Only part of my order was dispensed.')
  })

  it('includes refundMethod/refundAccount when present, omits them when absent', async () => {
    postFormMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')

    await JotFormRepository.submit({
      ...baseClaim,
      refundMethod: 'Zelle',
      refundAccount: 'test@example.com',
    })
    const [, fieldsWithRefund] = postFormMock.mock.calls[0]
    expect(fieldsWithRefund['submission[20]']).toBe('Zelle')
    expect(fieldsWithRefund['submission[21]']).toBe('test@example.com')

    postFormMock.mockClear()
    await JotFormRepository.submit(baseClaim)
    const [, fieldsWithoutRefund] = postFormMock.mock.calls[0]
    expect(fieldsWithoutRefund['submission[20]']).toBeUndefined()
    expect(fieldsWithoutRefund['submission[21]']).toBeUndefined()
  })

  it('submits multipart with the photo attached to submission[12] when a photo is present', async () => {
    postMultipartMock.mockResolvedValue({ responseCode: 200, message: 'success' })
    const { JotFormRepository } = await import('@/repositories/JotFormRepository')

    await JotFormRepository.submit({
      ...baseClaim,
      photo: {
        buffer: Buffer.from([0xff, 0xd8, 0xff]),
        filename: 'issue.jpg',
        contentType: 'image/jpeg',
      },
    })

    expect(postMultipartMock).toHaveBeenCalledTimes(1)
    expect(postFormMock).not.toHaveBeenCalled()
    const [url, formData] = postMultipartMock.mock.calls[0]
    expect(url).toContain('api.jotform.com/form/230405763622148/submissions')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('submission[12]')).toBeInstanceOf(Blob)
  })

  it('propagates an error when the underlying HTTP call fails, so the sync hook can record it', async () => {
    vi.stubEnv('JOTFORM_API_KEY', 'test-key')
    postFormMock.mockRejectedValue(new Error('ServerHttpClient: POST ... failed with 500'))

    const { JotFormRepository } = await import('@/repositories/JotFormRepository')
    await expect(JotFormRepository.submit(baseClaim)).rejects.toThrow('failed with 500')
  })
})

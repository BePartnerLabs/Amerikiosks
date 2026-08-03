import { afterEach, describe, expect, it, vi } from 'vitest'

const postMock = vi.fn()
const postMultipartMock = vi.fn()

vi.mock('@/repositories/clients/ServerHttpClient', () => ({
  serverHttpClient: { post: postMock, postMultipart: postMultipartMock },
}))

const baseClaim = {
  kioskBrand: "Carlo's Bakery",
  paymentMethod: 'card',
  customerFirstName: 'Test',
  customerLastName: 'Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: 'BePartnerLabs Test Property, Doral, FL',
  claimReason: 'partial_dispense',
  additionalInfo: 'Test note',
  lastFourCardDigits: '0000',
} as const

const findGlobalMock = vi.fn()

function fakeReq(apiToken = 'test-token') {
  findGlobalMock.mockResolvedValue({ mondayApiToken: apiToken })
  return { payload: { findGlobal: findGlobalMock } } as never
}

describe('MondayRepository', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('reads the API token from the Settings global and sends it as an Authorization header', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })

    const { MondayRepository } = await import('@/repositories/MondayRepository')
    const req = fakeReq('test-token')
    await MondayRepository.submit(baseClaim, req)

    expect(findGlobalMock).toHaveBeenCalledWith(expect.objectContaining({ slug: 'settings' }))
    expect(postMock).toHaveBeenCalledWith('https://api.monday.com/v2', expect.any(Object), {
      Authorization: 'test-token',
    })
  })

  it('posts the mutation against the target board/group with column_values mapped from the claim', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository, MONDAY_BOARD_ID, MONDAY_GROUP_ID } = await import(
      '@/repositories/MondayRepository'
    )
    await MondayRepository.submit(baseClaim, fakeReq())

    const [, body] = postMock.mock.calls[0]
    expect(body.variables.boardId).toBe(MONDAY_BOARD_ID)
    expect(body.variables.groupId).toBe(MONDAY_GROUP_ID)
    expect(body.variables.itemName).toBe('Test Prueba')

    const columnValues = JSON.parse(body.variables.columnValues)
    expect(columnValues.text7).toBe('Test Prueba')
    expect(columnValues.dropdown).toEqual({ labels: ['Credit/Debit Card'] })
    expect(columnValues.email).toEqual({
      email: 'hola@bepartnerlabs.com',
      text: 'hola@bepartnerlabs.com',
    })
    expect(columnValues.phone).toEqual({ phone: '3055550100', countryShortName: 'US' })
    expect(columnValues.date4).toEqual({ date: '2026-07-08' })
    expect(columnValues.dropdown0).toEqual({ labels: ['Only part of my order was dispensed.'] })
    expect(columnValues.numbers3).toBe('0000')
    expect(columnValues.text__1).toBe("Carlo's Bakery")
    expect(columnValues.text9).toBe('BePartnerLabs Test Property, Doral, FL')
  })

  it('concatenates additionalInfo, transaction time, refundMethod, and refundAccount into long_text6', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository } = await import('@/repositories/MondayRepository')

    await MondayRepository.submit(
      { ...baseClaim, refundMethod: 'Zelle', refundAccount: 'test@example.com' },
      fakeReq(),
    )

    const [, body] = postMock.mock.calls[0]
    const columnValues = JSON.parse(body.variables.columnValues)
    expect(columnValues.long_text6.text).toContain('Test note')
    expect(columnValues.long_text6.text).toContain('Transaction time:')
    expect(columnValues.long_text6.text).toContain('Refund method: Zelle')
    expect(columnValues.long_text6.text).toContain('Refund account: test@example.com')
  })

  it("strips formatting characters from customerPhone before sending — Monday's phone column rejects them", async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository } = await import('@/repositories/MondayRepository')

    await MondayRepository.submit({ ...baseClaim, customerPhone: '(305) 555-0100' }, fakeReq())
    const [, body] = postMock.mock.calls[0]
    expect(JSON.parse(body.variables.columnValues).phone).toEqual({
      phone: '3055550100',
      countryShortName: 'US',
    })
  })

  it('does not set numbers1 ("Ammount") — no equivalent claim field, left for the board operator', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository } = await import('@/repositories/MondayRepository')

    await MondayRepository.submit(baseClaim, fakeReq())
    const [, body] = postMock.mock.calls[0]
    expect(JSON.parse(body.variables.columnValues).numbers1).toBeUndefined()
  })

  it('sets the Kiosk ID column when machineId is present, omits it when absent', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository } = await import('@/repositories/MondayRepository')

    await MondayRepository.submit({ ...baseClaim, machineId: 'KIOSK-42' }, fakeReq())
    const [, bodyWithMachineId] = postMock.mock.calls[0]
    expect(JSON.parse(bodyWithMachineId.variables.columnValues).text_mkve20y8).toBe('KIOSK-42')

    postMock.mockClear()
    await MondayRepository.submit(baseClaim, fakeReq())
    const [, bodyWithoutMachineId] = postMock.mock.calls[0]
    expect(JSON.parse(bodyWithoutMachineId.variables.columnValues).text_mkve20y8).toBeUndefined()
  })

  it('uploads the photo via add_file_to_column after item creation, using the created item id', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '999' } } })
    postMultipartMock.mockResolvedValue({ data: { add_file_to_column: { id: 'file-1' } } })

    const { MondayRepository } = await import('@/repositories/MondayRepository')
    await MondayRepository.submit(
      {
        ...baseClaim,
        photo: {
          buffer: Buffer.from([0xff, 0xd8, 0xff]),
          filename: 'issue.jpg',
          contentType: 'image/jpeg',
        },
      },
      fakeReq('test-token'),
    )

    expect(postMultipartMock).toHaveBeenCalledTimes(1)
    const [url, formData, headers] = postMultipartMock.mock.calls[0]
    expect(url).toBe('https://api.monday.com/v2')
    expect(headers).toEqual({ Authorization: 'test-token' })
    expect(formData).toBeInstanceOf(FormData)
    // Same as GenericMondayRepository.addFile: through a variable rather than
    // pasted into the query text.
    const query = String(formData.get('query'))
    expect(query).toContain('$itemId: ID!')
    expect(query).toContain('item_id: $itemId')
    expect(query).not.toContain('999')
    expect(formData.get('variables[itemId]')).toBe('999')
    expect(formData.get('variables[columnId]')).toBe('files3')
    expect(formData.get('variables[file]')).toBeInstanceOf(Blob)
  })

  it('does not attempt a file upload when no photo is present', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '1' } } })
    const { MondayRepository } = await import('@/repositories/MondayRepository')
    await MondayRepository.submit(baseClaim, fakeReq())
    expect(postMultipartMock).not.toHaveBeenCalled()
  })

  it('throws when the Monday API response contains a GraphQL errors array', async () => {
    postMock.mockResolvedValue({ errors: [{ message: 'Invalid column value' }] })
    const { MondayRepository } = await import('@/repositories/MondayRepository')
    await expect(MondayRepository.submit(baseClaim, fakeReq())).rejects.toThrow(
      'Invalid column value',
    )
  })

  it('propagates an error when the underlying HTTP call fails, so the sync hook can record it', async () => {
    postMock.mockRejectedValue(new Error('ServerHttpClient: POST ... failed with 500'))
    const { MondayRepository } = await import('@/repositories/MondayRepository')
    await expect(MondayRepository.submit(baseClaim, fakeReq())).rejects.toThrow('failed with 500')
  })
})

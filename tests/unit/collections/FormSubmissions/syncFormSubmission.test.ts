import { afterEach, describe, expect, it, vi } from 'vitest'

const submitMock = vi.fn()
const addFileMock = vi.fn()
class MockMondayApiError extends Error {
  errors: Array<{
    message: string
    extensions?: {
      code?: string
      error_data?: { column_id?: string; column_type?: string; column_name?: string }
    }
  }>
  constructor(errors: MockMondayApiError['errors']) {
    super('mock monday api error')
    this.errors = errors
  }
}
vi.mock('@/repositories/GenericMondayRepository', () => ({
  GenericMondayRepository: { submit: submitMock, addFile: addFileMock },
  MondayApiError: MockMondayApiError,
}))

const getPrivateFileBufferMock = vi.fn()
vi.mock('@/utilities/privateUpload', () => ({
  getPrivateFileBuffer: (...args: unknown[]) => getPrivateFileBufferMock(...args),
}))

const findByIDMock = vi.fn()
const updateMock = vi.fn()
const findGlobalMock = vi.fn()
const loggerErrorMock = vi.fn()
const loggerWarnMock = vi.fn()

function fakePayload() {
  return {
    findByID: findByIDMock,
    update: updateMock,
    findGlobal: findGlobalMock,
    logger: { error: loggerErrorMock, warn: loggerWarnMock },
  } as never
}

const baseForm = {
  id: 10,
  title: 'Placement Application',
  integrationTarget: 'monday',
  externalId: '4024476985',
  mondayGroupId: 'topics',
  fields: [
    { name: 'contact-name', externalId: 'item_name' },
    { name: 'property-name', externalId: 'text0' },
    { name: 'photo', externalId: 'files3' },
  ],
}

describe('syncFormSubmission', () => {
  afterEach(() => {
    // resetAllMocks, not clearAllMocks: these tests set implementations
    // (mockResolvedValue/mockRejectedValue), and clearing only wipes call
    // history — a rejection set in one test would leak into the next.
    vi.resetAllMocks()
  })

  // The whole point of moving this out of afterChange: it runs after the
  // submission is committed, so nothing it does may propagate an exception
  // back to the caller and take the stored lead with it.
  it('never throws, even when every Payload call it makes fails', async () => {
    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    findByIDMock.mockRejectedValue(new Error('connection terminated'))
    updateMock.mockRejectedValue(new Error('connection terminated'))

    await expect(
      syncFormSubmission({
        payload: fakePayload(),
        doc: { id: 1, form: 10, submissionData: [] } as never,
      }),
    ).resolves.toBeUndefined()
  })

  it('no-ops when the form has integrationTarget: none', async () => {
    findByIDMock.mockResolvedValue({ ...baseForm, integrationTarget: 'none' })
    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: { id: 1, form: 10, submissionData: [] } as never,
    })
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('records an error for a non-monday, non-none target (odoo not yet implemented)', async () => {
    findByIDMock.mockResolvedValue({ ...baseForm, integrationTarget: 'odoo' })
    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: { id: 1, form: 10, submissionData: [] } as never,
    })
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          syncStatus: 'error',
          syncError: expect.stringContaining('odoo'),
        }),
      }),
    )
  })

  it('builds column_values from fields with externalId, uses the item_name field as the title, and marks synced', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    submitMock.mockResolvedValue({ id: '999' })

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
          { field: 'unmapped-field', value: 'ignored' },
        ],
      } as never,
    })

    expect(submitMock).toHaveBeenCalledWith(
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: 'Grand Hotel' },
      'test-token',
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ syncStatus: 'synced' }),
      }),
    )
  })

  it('wraps the value in {text: ...} only for column types that require it, per the cached board schema', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    findGlobalMock.mockResolvedValue({
      mondayApiToken: 'test-token',
      mondayBoardsCache: {
        syncedAt: '2026-01-01T00:00:00.000Z',
        boards: [
          {
            id: '4024476985',
            name: 'Board',
            groups: [],
            columns: [{ id: 'text0', title: 'Property Name', type: 'long_text' }],
          },
        ],
      },
    })
    submitMock.mockResolvedValue({ id: '999' })

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
        ],
      } as never,
    })

    expect(submitMock).toHaveBeenCalledWith(
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: { text: 'Grand Hotel' } },
      'test-token',
    )
  })

  it('builds a {phone, countryShortName} value for a "phone" column', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    findGlobalMock.mockResolvedValue({
      mondayApiToken: 'test-token',
      mondayBoardsCache: {
        syncedAt: '2026-01-01T00:00:00.000Z',
        boards: [
          {
            id: '4024476985',
            name: 'Board',
            groups: [],
            columns: [{ id: 'text0', title: 'Phone', type: 'phone' }],
          },
        ],
      },
    })
    submitMock.mockResolvedValue({ id: '999' })

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: '555-0100' },
        ],
      } as never,
    })

    expect(submitMock).toHaveBeenCalledWith(
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: { phone: '555-0100', countryShortName: 'US' } },
      'test-token',
    )
  })

  it('pulls attachments from the private bucket and forwards them to their Monday column', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    submitMock.mockResolvedValue({ id: '999' })
    getPrivateFileBufferMock.mockResolvedValue({
      buffer: Buffer.from([1, 2, 3]),
      contentType: 'image/jpeg',
    })
    // No URL is ever involved: the bucket has no public access, which is the
    // reason attachments live there rather than in the public media collection.
    const fetchSpy = vi.fn()
    global.fetch = fetchSpy as never

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [{ field: 'contact-name', value: 'Jane Doe' }],
        attachments: [
          { field: 'photo', key: 'abc-123.jpg', filename: 'photo.jpg', mimeType: 'image/jpeg' },
        ],
      } as never,
    })

    expect(getPrivateFileBufferMock).toHaveBeenCalledWith('abc-123.jpg')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(addFileMock).toHaveBeenCalledWith(
      '999',
      'files3',
      expect.objectContaining({ filename: 'photo.jpg', contentType: 'image/jpeg' }),
      'test-token',
    )
  })

  it('records an error and does not throw when the Monday submit call fails', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    submitMock.mockRejectedValue(new Error('Monday API returned errors: boom'))

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [{ field: 'contact-name', value: 'Jane Doe' }],
      } as never,
    })

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          syncStatus: 'error',
          syncError: expect.stringContaining('boom'),
        }),
      }),
    )
  })

  it('retries once using the real column_type Monday reports on a ColumnValueException, when the cache is stale', async () => {
    findByIDMock.mockResolvedValue(baseForm)
    // Cache (wrongly) thinks text0 is long_text — Monday's error will say
    // the real column type is "text".
    findGlobalMock.mockResolvedValue({
      mondayApiToken: 'test-token',
      mondayBoardsCache: {
        syncedAt: '2026-01-01T00:00:00.000Z',
        boards: [
          {
            id: '4024476985',
            name: 'Board',
            groups: [],
            columns: [{ id: 'text0', title: 'Property Name', type: 'long_text' }],
          },
        ],
      },
    })
    submitMock
      .mockRejectedValueOnce(
        new MockMondayApiError([
          {
            message: 'invalid value',
            extensions: {
              code: 'ColumnValueException',
              error_data: { column_id: 'text0', column_type: 'text', column_name: 'Property Name' },
            },
          },
        ]),
      )
      .mockResolvedValueOnce({ id: '999' })

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
        ],
      } as never,
    })

    expect(submitMock).toHaveBeenCalledTimes(2)
    expect(submitMock).toHaveBeenNthCalledWith(
      1,
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: { text: 'Grand Hotel' } },
      'test-token',
    )
    expect(submitMock).toHaveBeenNthCalledWith(
      2,
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: 'Grand Hotel' },
      'test-token',
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ syncStatus: 'synced' }),
      }),
    )
  })

  it('treats a raw "name" externalId as the item title, same as "item_name"', async () => {
    findByIDMock.mockResolvedValue({
      ...baseForm,
      fields: [
        { name: 'contact-name', externalId: 'name' },
        { name: 'property-name', externalId: 'text0' },
      ],
    })
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    submitMock.mockResolvedValue({ id: '999' })

    const { syncFormSubmission } = await import(
      '@/collections/FormSubmissions/hooks/syncFormSubmission'
    )
    await syncFormSubmission({
      payload: fakePayload(),
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
        ],
      } as never,
    })

    // "Jane Doe" becomes the item title, and no "name" key leaks into
    // column_values — Monday rejects writes to that pseudo-column.
    expect(submitMock).toHaveBeenCalledWith(
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: 'Grand Hotel' },
      'test-token',
    )
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

const submitMock = vi.fn()
const addFileMock = vi.fn()
vi.mock('@/repositories/GenericMondayRepository', () => ({
  GenericMondayRepository: { submit: submitMock, addFile: addFileMock },
}))

const findByIDMock = vi.fn()
const updateMock = vi.fn()
const findGlobalMock = vi.fn()
const loggerErrorMock = vi.fn()

function fakeReq(context?: Record<string, unknown>) {
  return {
    context,
    payload: {
      findByID: findByIDMock,
      update: updateMock,
      findGlobal: findGlobalMock,
      logger: { error: loggerErrorMock },
    },
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

describe('dispatchFormSync', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('no-ops on update (only runs on create)', async () => {
    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: { id: 1, form: 10, submissionData: [] },
      operation: 'update',
      req: fakeReq(),
    } as never)
    expect(findByIDMock).not.toHaveBeenCalled()
  })

  it('no-ops when the form has integrationTarget: none', async () => {
    findByIDMock.mockResolvedValue({ ...baseForm, integrationTarget: 'none' })
    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: { id: 1, form: 10, submissionData: [] },
      operation: 'create',
      req: fakeReq(),
    } as never)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('records an error for a non-monday, non-none target (odoo not yet implemented)', async () => {
    findByIDMock.mockResolvedValue({ ...baseForm, integrationTarget: 'odoo' })
    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: { id: 1, form: 10, submissionData: [] },
      operation: 'create',
      req: fakeReq(),
    } as never)
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

    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
          { field: 'unmapped-field', value: 'ignored' },
        ],
      },
      operation: 'create',
      req: fakeReq(),
    } as never)

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

    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: {
        id: 1,
        form: 10,
        submissionData: [
          { field: 'contact-name', value: 'Jane Doe' },
          { field: 'property-name', value: 'Grand Hotel' },
        ],
      },
      operation: 'create',
      req: fakeReq(),
    } as never)

    expect(submitMock).toHaveBeenCalledWith(
      '4024476985',
      'topics',
      'Jane Doe',
      { text0: { text: 'Grand Hotel' } },
      'test-token',
    )
  })

  it('fetches and attaches uploaded files to their mapped Monday column', async () => {
    findByIDMock.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'forms') return baseForm
      return {
        id: 5,
        url: 'https://example.com/photo.jpg',
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
      }
    })
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    submitMock.mockResolvedValue({ id: '999' })
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    }) as never

    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: {
        id: 1,
        form: 10,
        submissionData: [{ field: 'contact-name', value: 'Jane Doe' }],
        submissionUploads: [{ field: 'photo', value: [{ value: 5 }] }],
      },
      operation: 'create',
      req: fakeReq(),
    } as never)

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

    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: { id: 1, form: 10, submissionData: [{ field: 'contact-name', value: 'Jane Doe' }] },
      operation: 'create',
      req: fakeReq(),
    } as never)

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          syncStatus: 'error',
          syncError: expect.stringContaining('boom'),
        }),
      }),
    )
  })

  it('skips its own update-triggered recursion via context.skipFormSync', async () => {
    const { dispatchFormSync } = await import(
      '@/collections/FormSubmissions/hooks/dispatchFormSync'
    )
    await dispatchFormSync({
      doc: { id: 1, form: 10, submissionData: [] },
      operation: 'create',
      req: fakeReq({ skipFormSync: true }),
    } as never)
    expect(findByIDMock).not.toHaveBeenCalled()
  })
})

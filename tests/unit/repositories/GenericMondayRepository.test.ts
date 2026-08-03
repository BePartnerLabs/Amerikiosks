import { afterEach, describe, expect, it, vi } from 'vitest'

const postMock = vi.fn()
const postMultipartMock = vi.fn()

vi.mock('@/repositories/clients/ServerHttpClient', () => ({
  serverHttpClient: { post: postMock, postMultipart: postMultipartMock },
}))

describe('GenericMondayRepository', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('posts create_item with the given board/group/itemName/columnValues and returns the created id', async () => {
    postMock.mockResolvedValue({ data: { create_item: { id: '123' } } })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    const result = await GenericMondayRepository.submit(
      '4024508641',
      'topics',
      'Test Item',
      { text0: { text: 'value' } },
      'test-token',
    )

    expect(postMock).toHaveBeenCalledWith(
      'https://api.monday.com/v2',
      expect.objectContaining({
        variables: expect.objectContaining({
          boardId: '4024508641',
          groupId: 'topics',
          itemName: 'Test Item',
          columnValues: JSON.stringify({ text0: { text: 'value' } }),
        }),
      }),
      { Authorization: 'test-token' },
    )
    expect(result).toEqual({ id: '123' })
  })

  it('throws when the Monday API response contains a GraphQL errors array', async () => {
    postMock.mockResolvedValue({ errors: [{ message: 'Invalid column value' }] })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    await expect(
      GenericMondayRepository.submit('4024508641', 'topics', 'Test', {}, 'test-token'),
    ).rejects.toThrow('Invalid column value')
  })

  it('throws when create_item does not return an id', async () => {
    postMock.mockResolvedValue({ data: { create_item: null } })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    await expect(
      GenericMondayRepository.submit('4024508641', 'topics', 'Test', {}, 'test-token'),
    ).rejects.toThrow('did not return an id')
  })

  it('addFile posts a multipart request targeting the given item/column', async () => {
    postMultipartMock.mockResolvedValue({ data: { add_file_to_column: { id: 'file-1' } } })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    await GenericMondayRepository.addFile(
      '999',
      'files3',
      { buffer: Buffer.from([1, 2, 3]), filename: 'photo.jpg', contentType: 'image/jpeg' },
      'test-token',
    )

    expect(postMultipartMock).toHaveBeenCalledTimes(1)
    const [url, formData, headers] = postMultipartMock.mock.calls[0]
    expect(url).toBe('https://api.monday.com/v2')
    expect(headers).toEqual({ Authorization: 'test-token' })
    // Through variables, not concatenated into the query text. The ids are
    // trusted today — itemId comes from Monday's own create_item response and
    // columnId is an admin-entered value checked against the board — but this
    // was the one place in the codebase where a value was pasted into a query,
    // and the safety lived in nobody happening to map that id from somewhere
    // user-controlled.
    const query = String(formData.get('query'))
    expect(query).toContain('$itemId: ID!')
    expect(query).toContain('$columnId: String!')
    expect(query).toContain('item_id: $itemId')
    expect(query).toContain('column_id: $columnId')
    expect(query).not.toContain('999')
    expect(query).not.toContain('"files3"')
    expect(formData.get('variables[itemId]')).toBe('999')
    expect(formData.get('variables[columnId]')).toBe('files3')
    expect(formData.get('variables[file]')).toBeInstanceOf(Blob)
  })

  // The check that would actually catch a regression: a value crafted to close
  // the string literal must stay a value.
  it('addFile keeps an injection-shaped column id as data', async () => {
    postMultipartMock.mockResolvedValue({ data: { add_file_to_column: { id: 'file-1' } } })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    const hostile = 'files3", extra: "x'
    await GenericMondayRepository.addFile(
      '1',
      hostile,
      { buffer: Buffer.from([1]), filename: 'a.jpg', contentType: 'image/jpeg' },
      'test-token',
    )

    const [, formData] = postMultipartMock.mock.calls[0]
    expect(String(formData.get('query'))).not.toContain('extra')
    expect(formData.get('variables[columnId]')).toBe(hostile)
  })

  it('addFile throws when the Monday API response contains a GraphQL errors array', async () => {
    postMultipartMock.mockResolvedValue({ errors: [{ message: 'bad file' }] })
    const { GenericMondayRepository } = await import('@/repositories/GenericMondayRepository')

    await expect(
      GenericMondayRepository.addFile(
        '999',
        'files3',
        { buffer: Buffer.from([1]), filename: 'a.jpg', contentType: 'image/jpeg' },
        'test-token',
      ),
    ).rejects.toThrow('bad file')
  })
})

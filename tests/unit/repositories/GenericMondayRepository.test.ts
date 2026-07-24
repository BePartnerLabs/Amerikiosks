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
    expect(String(formData.get('query'))).toContain('item_id: 999')
    expect(String(formData.get('query'))).toContain('column_id: "files3"')
    expect(formData.get('variables[file]')).toBeInstanceOf(Blob)
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

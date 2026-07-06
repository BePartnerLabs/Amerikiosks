import { describe, expect, it, vi } from 'vitest'

const post = vi.fn().mockResolvedValue(undefined)

vi.mock('@/repositories/clients/ApiClient', () => ({
  apiClient: { post },
}))

describe('FormsRepository.submit', () => {
  it('posts the submission to /form-submissions', async () => {
    const { FormsRepository } = await import('@/repositories/FormsRepository')
    const data = { form: 'contact', submissionData: [{ field: 'email', value: 'a@b.com' }] }

    await FormsRepository.submit(data)

    expect(post).toHaveBeenCalledWith('/form-submissions', data)
  })
})

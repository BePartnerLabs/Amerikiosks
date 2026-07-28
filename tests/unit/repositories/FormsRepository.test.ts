import { afterEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn().mockResolvedValue(undefined)
const postFormData = vi.fn().mockResolvedValue(undefined)

vi.mock('@/repositories/clients/ApiClient', () => ({
  apiClient: { post, postFormData },
}))

describe('FormsRepository.submit', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('posts JSON to /next/form-submissions when there are no file fields', async () => {
    const { FormsRepository } = await import('@/repositories/FormsRepository')
    const data = { form: 'contact', submissionData: [{ field: 'email', value: 'a@b.com' }] }

    await FormsRepository.submit(data)

    expect(post).toHaveBeenCalledWith('/next/form-submissions', data)
    expect(postFormData).not.toHaveBeenCalled()
  })

  it('posts multipart with a _payload JSON part and one part per file field when a File is present', async () => {
    const { FormsRepository } = await import('@/repositories/FormsRepository')
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    const data = {
      form: 'placement-application',
      submissionData: [
        { field: 'email', value: 'a@b.com' },
        { field: 'photo', value: file },
      ],
    }

    await FormsRepository.submit(data)

    expect(post).not.toHaveBeenCalled()
    expect(postFormData).toHaveBeenCalledTimes(1)
    const [path, formData] = postFormData.mock.calls[0]
    expect(path).toBe('/next/form-submissions')
    expect(formData).toBeInstanceOf(FormData)

    const payload = JSON.parse(formData.get('_payload') as string)
    expect(payload.submissionData).toEqual([{ field: 'email', value: 'a@b.com' }])
    expect(formData.get('photo')).toBeInstanceOf(File)
  })
})

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const useDocumentInfoMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({ useDocumentInfo: () => useDocumentInfoMock() }))

import { ViewPhotoButton } from '@/collections/Claims/components/ViewPhotoButton'
import { ViewAttachmentsButton } from '@/collections/FormSubmissions/components/ViewAttachmentsButton'

const openMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('open', openMock)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

// Both buttons exist because the stored value is an R2 object key, not a URL:
// without them, viewing a submitted file means calling the signing endpoint by
// hand. The signed URL is short-lived, which is why it is fetched on click
// rather than rendered as a link.
describe('ViewPhotoButton (claims)', () => {
  it('fetches the signed url for the claim and opens it in a new tab', async () => {
    useDocumentInfoMock.mockReturnValue({ id: 7 })
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ url: 'https://signed.example/x.jpg' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<ViewPhotoButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(openMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith('/api/claims/7/photo-url')
    // noopener matters: the signed URL is opened on a page the staff member is
    // authenticated on.
    expect(openMock).toHaveBeenCalledWith(
      'https://signed.example/x.jpg',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('explains itself when the claim carries no photo', async () => {
    useDocumentInfoMock.mockReturnValue({ id: 7 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }))

    render(<ViewPhotoButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText(/no submitted photo/i)).toBeInTheDocument())
    expect(openMock).not.toHaveBeenCalled()
  })

  it('surfaces a network failure instead of silently doing nothing', async () => {
    useDocumentInfoMock.mockReturnValue({ id: 7 })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<ViewPhotoButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('offline')).toBeInTheDocument())
  })
})

describe('ViewAttachmentsButton (form submissions)', () => {
  // Nothing to view means no button — an empty control that errors on click is
  // worse than no control.
  it('renders nothing when the submission has no attachments', () => {
    useDocumentInfoMock.mockReturnValue({ id: 3, savedDocumentData: { attachments: [] } })
    const { container } = render(<ViewAttachmentsButton />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing before the document is saved', () => {
    useDocumentInfoMock.mockReturnValue({ id: undefined, savedDocumentData: {} })
    const { container } = render(<ViewAttachmentsButton />)
    expect(container).toBeEmptyDOMElement()
  })

  // One button per attachment, each signing its own field — a form can carry
  // more than one upload field.
  it('renders one button per attachment and asks for that field', async () => {
    useDocumentInfoMock.mockReturnValue({
      id: 3,
      savedDocumentData: {
        attachments: [
          { field: 'photo', filename: 'a.jpg' },
          { field: 'upload-media', filename: 'b.png' },
        ],
      },
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ url: 'https://signed.example/b.png' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<ViewAttachmentsButton />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)

    fireEvent.click(buttons[1])
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/form-submissions/3/attachment-url?field=upload-media',
    )
  })

  // Field names come from the CMS and can contain anything an editor typed.
  it('encodes a field name with characters that would break the query', async () => {
    useDocumentInfoMock.mockReturnValue({
      id: 3,
      savedDocumentData: { attachments: [{ field: 'a&b c', filename: 'x.jpg' }] },
    })
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ url: 'https://x/y' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<ViewAttachmentsButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock.mock.calls[0][0]).toContain('field=a%26b%20c')
  })

  it('reports the error when the endpoint has no url to give', async () => {
    useDocumentInfoMock.mockReturnValue({
      id: 3,
      savedDocumentData: { attachments: [{ field: 'photo', filename: 'a.jpg' }] },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ error: 'gone' }) }))

    render(<ViewAttachmentsButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('gone')).toBeInTheDocument())
  })
})

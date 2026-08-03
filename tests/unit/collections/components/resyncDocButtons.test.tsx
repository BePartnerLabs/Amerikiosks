import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const useDocumentInfoMock = vi.fn(() => ({ id: 42 }))
vi.mock('@payloadcms/ui', () => ({ useDocumentInfo: () => useDocumentInfoMock() }))

import { ResyncDocButton as ClaimResync } from '@/collections/Claims/components/ResyncDocButton'
import { ResyncDocButton as SubmissionResync } from '@/collections/FormSubmissions/components/ResyncDocButton'

// Reset the *implementation*, not just the call history: the last case below
// sets `id: undefined`, and clearAllMocks would leave that leaking into the
// next describe block.
beforeEach(() => {
  useDocumentInfoMock.mockReturnValue({ id: 42 })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

const cases = [
  {
    name: 'form submission',
    Component: SubmissionResync,
    endpoint: '/api/form-submissions/resync',
    key: 'submissionId',
  },
  { name: 'claim', Component: ClaimResync, endpoint: '/api/claims/resync', key: 'claimId' },
] as const

describe.each(cases)('$name resync button', ({ Component, endpoint, key }) => {
  it('posts the id of the document being viewed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<Component />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(endpoint)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ [key]: 42 })
  })

  it('reports success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ ok: true }) }))

    render(<Component />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText(/éxito/i)).toBeInTheDocument())
  })

  // The endpoint reports a failed sync in the body rather than by status, so a
  // button that only checked for a thrown error would call every failure a
  // success — which is the one thing this button must never do.
  it('surfaces a failure reported in the response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ ok: false, error: 'column rejected' }) }),
    )

    render(<Component />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('column rejected')).toBeInTheDocument())
  })

  it('surfaces a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<Component />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('offline')).toBeInTheDocument())
  })

  // An unsaved document has no id yet; posting would resync nothing.
  it('does nothing when there is no document id', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    useDocumentInfoMock.mockReturnValue({ id: undefined } as never)

    render(<Component />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled())
  })
})

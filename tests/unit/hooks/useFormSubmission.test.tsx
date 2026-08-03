import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type React from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submitMock = vi.fn()
vi.mock('@/repositories', () => ({
  FormsRepository: { submit: (...a: unknown[]) => submitMock(...a) },
}))

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))

import { useFormSubmission } from '@/hooks/queries/useFormSubmission'

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const turnstile = { token: 'tok', reset: vi.fn() }

function setup(overrides: Record<string, unknown> = {}) {
  const honeypotRef = createRef<HTMLInputElement>() as React.RefObject<HTMLInputElement | null>
  const renderedAtRef = { current: 1_000 }
  return renderHook(
    () =>
      useFormSubmission({
        formID: '9',
        declaredFields: ['name', 'email'],
        honeypotRef,
        renderedAtRef,
        turnstile,
        ...overrides,
      } as never),
    { wrapper },
  )
}

beforeEach(() => {
  submitMock.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useFormSubmission', () => {
  // react-hook-form seeds its state from the fields *array*, so the submitted
  // object also carries numeric indices whose values are whole field configs.
  // The route rejects anything the form does not declare, and sending them
  // turned every real submission into a 400.
  it('sends only the declared fields, dropping react-hook-form array indices', async () => {
    const { result } = setup()

    act(() => {
      result.current.submit({ name: 'Ada', email: 'ada@example.com', 0: { name: 'name' } } as never)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    const [payload] = submitMock.mock.calls[0]
    expect(payload.submissionData).toEqual([
      { field: 'name', value: 'Ada' },
      { field: 'email', value: 'ada@example.com' },
    ])
    expect(payload.form).toBe('9')
    expect(payload.turnstileToken).toBe('tok')
  })

  // The consent box is rendered by the block itself, not declared as a
  // form-builder field, so it has to be allowed through explicitly.
  it('lets the consent answer through when the form requires it', async () => {
    const { result } = setup({ requiresConsent: true })

    act(() => {
      result.current.submit({ name: 'Ada', consent: true } as never)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    expect(submitMock.mock.calls[0][0].submissionData).toContainEqual({
      field: 'consent',
      value: true,
    })
  })

  it('drops the consent answer when the form does not require it', async () => {
    const { result } = setup()

    act(() => {
      result.current.submit({ name: 'Ada', consent: true } as never)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    expect(submitMock.mock.calls[0][0].submissionData).not.toContainEqual(
      expect.objectContaining({ field: 'consent' }),
    )
  })

  // The success node carries the GA attributes, and it never renders for a
  // redirect confirmation — without this the lead goes untracked.
  it('fires generate_lead and navigates on a redirect confirmation', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    const { result } = setup({
      confirmationType: 'redirect',
      redirectUrl: '/gracias',
      title: 'Design Your Kiosk',
    })

    act(() => {
      result.current.submit({ name: 'Ada' } as never)
    })

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/gracias'))
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'generate_lead',
      expect.objectContaining({ form_name: 'Design Your Kiosk' }),
    )
    vi.unstubAllGlobals()
  })

  it('does not navigate for a message confirmation', async () => {
    const { result } = setup({ confirmationType: 'message', redirectUrl: '/gracias' })

    act(() => {
      result.current.submit({ name: 'Ada' } as never)
    })

    await waitFor(() => expect(result.current.hasSubmitted).toBe(true))
    expect(pushMock).not.toHaveBeenCalled()
  })

  // A used Turnstile token cannot be replayed, so retrying without resetting
  // the widget fails again — and looks to the visitor like the form is broken.
  it('resets Turnstile when the submission fails', async () => {
    submitMock.mockRejectedValue(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = setup()

    act(() => {
      result.current.submit({ name: 'Ada' } as never)
    })

    await waitFor(() => expect(turnstile.reset).toHaveBeenCalled())
    expect(result.current.error).toBeTruthy()
  })

  it('retry re-sends the last payload and clears the previous error', async () => {
    submitMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(undefined)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = setup()

    act(() => {
      result.current.submit({ name: 'Ada' } as never)
    })
    await waitFor(() => expect(result.current.error).toBeTruthy())

    act(() => {
      result.current.retry({ name: 'Ada' } as never)
    })

    await waitFor(() => expect(result.current.hasSubmitted).toBe(true))
    expect(submitMock).toHaveBeenCalledTimes(2)
  })

  it('retry does nothing when there is no previous payload', async () => {
    const { result } = setup()

    act(() => {
      result.current.retry(undefined)
    })

    await waitFor(() => expect(submitMock).not.toHaveBeenCalled())
  })
})

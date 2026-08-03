import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submitMock = vi.fn()
vi.mock('@/repositories', () => ({
  ClaimsRepository: { submit: (...a: unknown[]) => submitMock(...a) },
}))

import { useClaimSubmission } from '@/hooks/queries/useClaimSubmission'

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const values = {
  kioskBrand: '12',
  paymentMethod: 'card',
  customerFirstName: 'Ada',
  customerLastName: 'Lovelace',
  customerEmail: 'ada@example.com',
  customerPhone: '+15550100',
  transactionDateTime: '2026-08-01T10:00',
  location: 'Test Mall',
  claimReason: 'partial_dispense',
  sawCreditsAvailable: 'no',
} as never

beforeEach(() => {
  submitMock.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useClaimSubmission', () => {
  // kioskBrand is a relationship id server-side, but every radio and select
  // value is a string in the DOM. Sending "12" instead of 12 is the kind of
  // thing that only shows up as a rejected claim.
  it('coerces kioskBrand to a number', async () => {
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    expect(submitMock.mock.calls[0][0].kioskBrand).toBe(12)
  })

  // UI-only branching state from the legacy JotForm's "Did you see credits
  // available?". It decides which step comes next and must never be sent.
  it('strips sawCreditsAvailable before sending', async () => {
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    expect(submitMock.mock.calls[0][0]).not.toHaveProperty('sawCreditsAvailable')
  })

  // The kiosk QR code carries ?machine_id=, which is how a claim gets tied to
  // the machine it came from.
  it('attaches the machine id and photo it was given', async () => {
    const photo = { name: 'receipt.jpg' } as File
    const { result } = renderHook(() => useClaimSubmission({ machineId: 'AK-0231', photo }), {
      wrapper,
    })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    expect(submitMock.mock.calls[0][0]).toMatchObject({ machineId: 'AK-0231', photo })
  })

  it('leaves machineId and photo undefined when there are none', async () => {
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(submitMock).toHaveBeenCalled())
    const sent = submitMock.mock.calls[0][0]
    expect(sent.machineId).toBeUndefined()
    expect(sent.photo).toBeUndefined()
  })

  // The confirmation screen echoes the claim back to the customer, so it reads
  // from what was actually sent rather than from the form state.
  it('exposes what was sent for the confirmation screen', async () => {
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(result.current.hasSubmitted).toBe(true))
    expect(result.current.submitted).toMatchObject({ customerEmail: 'ada@example.com' })
  })

  it('starts with an empty submitted object rather than undefined', () => {
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })
    expect(result.current.submitted).toEqual({})
  })

  it('surfaces a failure instead of swallowing it', async () => {
    submitMock.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useClaimSubmission({}), { wrapper })

    act(() => {
      result.current.submit(values)
    })

    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.hasSubmitted).toBe(false)
  })
})

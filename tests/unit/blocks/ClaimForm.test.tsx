import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('machine_id=AK-0231'),
}))

vi.mock('@tanstack/react-query', () => ({ useMutation: vi.fn() }))

import { useMutation } from '@tanstack/react-query'
import { ClaimFormBlock } from '@/blocks/ClaimForm/Component'

const mockUseMutation = vi.mocked(useMutation)
const mutate = vi.fn()
let mutationState: {
  isPending: boolean
  isSuccess: boolean
  error: Error | null
  variables?: unknown
} = { isPending: false, isSuccess: false, error: null }

mockUseMutation.mockImplementation(
  () =>
    ({
      mutate: (data: unknown) => {
        mutationState.variables = data
        mutate(data)
      },
      isPending: mutationState.isPending,
      isSuccess: mutationState.isSuccess,
      error: mutationState.error,
      variables: mutationState.variables,
      // biome-ignore lint/suspicious/noExplicitAny: partial mock of react-query's UseMutationResult
    }) as any,
)

const brands = [
  { id: 1, name: "Carlo's Bakery" },
  { id: 2, name: 'Pharmabox by CVS' },
]

function clickNext() {
  fireEvent.click(screen.getByRole('button', { name: /next/i }))
}

async function completeAllSteps() {
  fireEvent.click(screen.getByRole('button', { name: /start/i }))

  fireEvent.click(await screen.findByRole('radio', { name: "Carlo's Bakery" }))
  clickNext()

  fireEvent.click(await screen.findByRole('radio', { name: /credit\/debit card/i }))
  clickNext()

  fireEvent.change(await screen.findByLabelText(/^name$/i), { target: { value: 'Test Prueba' } })
  clickNext()

  fireEvent.change(await screen.findByLabelText(/email/i), {
    target: { value: 'hola@bepartnerlabs.com' },
  })
  clickNext()

  fireEvent.change(await screen.findByLabelText(/phone/i), { target: { value: '3055550100' } })
  clickNext()

  // transactionDateTime step — prefilled by default, just advance
  await screen.findByLabelText(/date and time/i)
  clickNext()

  fireEvent.change(await screen.findByLabelText(/state/i), { target: { value: 'FL' } })
  fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Doral' } })
  fireEvent.change(screen.getByLabelText(/property/i), {
    target: { value: 'BePartnerLabs Test Property' },
  })
  clickNext()

  fireEvent.change(await screen.findByLabelText(/what happened/i), {
    target: { value: 'partial_dispense' },
  })
  clickNext()

  // additionalInfo (optional) — skip
  await screen.findByLabelText(/additional information/i)
  clickNext()

  // lastFourCardDigits (optional) — last step, submit
  await screen.findByLabelText(/last 4 digits/i)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
}

describe('ClaimForm block', () => {
  afterEach(() => {
    cleanup()
    mutate.mockClear()
    mutationState = { isPending: false, isSuccess: false, error: null, variables: undefined }
  })

  it('shows an intro screen with a Start button before the first field', () => {
    render(<ClaimFormBlock brands={brands} />)
    expect(screen.getByRole('heading', { name: /request a refund/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /kiosk brand/i })).toBeNull()
  })

  it('is multi-step: only one field group is visible per screen', () => {
    render(<ClaimFormBlock brands={brands} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(screen.getByRole('group', { name: /kiosk brand/i })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /payment method/i })).toBeNull()
  })

  it('renders kiosk brand options from props', () => {
    render(<ClaimFormBlock brands={brands} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('radio', { name: "Carlo's Bakery" })).toBeInTheDocument()
  })

  it('does not advance past a required step when it is left empty', async () => {
    render(<ClaimFormBlock brands={brands} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    clickNext()

    expect(await screen.findByRole('group', { name: /kiosk brand/i })).toBeInTheDocument()
  })

  it('completes the full flow and includes machineId (from the URL query param) in the submitted payload', async () => {
    render(<ClaimFormBlock brands={brands} />)
    await completeAllSteps()

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ machineId: 'AK-0231', customerName: 'Test Prueba' }),
      )
    })
  })

  it('on success, renders a summary with the real field labels (not JotForm-style placeholders)', () => {
    mutationState = {
      isPending: false,
      isSuccess: true,
      error: null,
      variables: {
        kioskBrand: '1',
        paymentMethod: 'card',
        customerName: 'Test Prueba',
        customerEmail: 'hola@bepartnerlabs.com',
        customerPhone: '3055550100',
        claimReason: 'partial_dispense',
        machineId: 'AK-0231',
      },
    }
    render(<ClaimFormBlock brands={brands} />)

    expect(screen.getByText(/kiosk brand/i)).toBeInTheDocument()
    expect(screen.getByText(/payment method/i)).toBeInTheDocument()
    expect(screen.queryByText(/type a question/i)).toBeNull()
  })

  it('the success node carries data-ga-event="claim_submit" and data-ga-machine-id for GAListener', () => {
    mutationState = {
      isPending: false,
      isSuccess: true,
      error: null,
      variables: { machineId: 'AK-0231', customerName: 'Test Prueba' },
    }
    render(<ClaimFormBlock brands={brands} />)

    const successNode = screen.getByTestId('claim-form-success')
    expect(successNode).toHaveAttribute('data-ga-event', 'claim_submit')
    expect(successNode).toHaveAttribute('data-ga-machine-id', 'AK-0231')
  })
})

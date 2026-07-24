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

// kioskBrand and paymentMethod auto-advance on click — no Next button is
// rendered on those steps (see isAutoAdvanceStep in Component.tsx).
async function completeAllSteps() {
  fireEvent.click(screen.getByRole('button', { name: /start/i }))

  fireEvent.click(await screen.findByRole('radio', { name: "Carlo's Bakery" }))

  fireEvent.click(await screen.findByRole('radio', { name: /credit\/debit card/i }))

  fireEvent.change(await screen.findByLabelText(/first name/i), { target: { value: 'Test' } })
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Prueba' } })
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'hola@bepartnerlabs.com' },
  })
  clickNext()

  fireEvent.change(await screen.findByLabelText(/phone/i), { target: { value: '3055550100' } })
  clickNext()

  // transactionDateTime step — prefilled by default, just advance
  await screen.findByLabelText(/date and time/i)
  clickNext()

  fireEvent.change(await screen.findByLabelText(/where did the issue happen/i), {
    target: { value: 'BePartnerLabs Test Property, Doral, FL' },
  })
  clickNext()

  fireEvent.change(await screen.findByLabelText(/what happened/i), {
    target: { value: 'partial_dispense' },
  })
  clickNext()

  // additionalInfo (optional) — skip
  await screen.findByLabelText(/additional information/i)
  clickNext()

  // lastFourCardDigits (required, card-only follow-up)
  fireEvent.change(await screen.findByLabelText(/last 4 digits/i), { target: { value: '1234' } })
  clickNext()

  // photo (optional) — skip
  await screen.findByText(/attach a picture/i)
  clickNext()

  // confirm step — last step, submit
  await screen.findByText(/review your information/i)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
}

describe('ClaimForm block', () => {
  afterEach(() => {
    cleanup()
    mutate.mockClear()
    mutationState = { isPending: false, isSuccess: false, error: null, variables: undefined }
  })

  const introContent = {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'heading',
          tag: 'h2',
          version: 1,
          children: [{ type: 'text', version: 1, text: 'Request a Refund' }],
        },
      ],
    },
    // biome-ignore lint/suspicious/noExplicitAny: minimal lexical fixture, not the full SerializedTextNode shape
  } as any

  it('shows an intro screen with a Start button before the first field', () => {
    render(
      <ClaimFormBlock
        brands={brands}
        introContent={introContent}
      />,
    )
    expect(screen.getByRole('heading', { name: /request a refund/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /kiosk brand/i })).toBeNull()
  })

  it('renders no intro heading/copy when introContent is not provided', () => {
    render(<ClaimFormBlock brands={brands} />)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
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

    fireEvent.click(await screen.findByRole('radio', { name: "Carlo's Bakery" }))
    fireEvent.click(await screen.findByRole('radio', { name: /credit\/debit card/i }))

    await screen.findByLabelText(/first name/i)
    clickNext()

    expect(await screen.findByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('does not advance past the last-4-digits step when it is left empty, for a card payment', async () => {
    render(<ClaimFormBlock brands={brands} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    fireEvent.click(await screen.findByRole('radio', { name: "Carlo's Bakery" }))
    fireEvent.click(await screen.findByRole('radio', { name: /credit\/debit card/i }))

    fireEvent.change(await screen.findByLabelText(/first name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Prueba' } })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'hola@bepartnerlabs.com' },
    })
    clickNext()

    fireEvent.change(await screen.findByLabelText(/phone/i), { target: { value: '3055550100' } })
    clickNext()

    await screen.findByLabelText(/date and time/i)
    clickNext()

    fireEvent.change(await screen.findByLabelText(/where did the issue happen/i), {
      target: { value: 'BePartnerLabs Test Property, Doral, FL' },
    })
    clickNext()

    fireEvent.change(await screen.findByLabelText(/what happened/i), {
      target: { value: 'partial_dispense' },
    })
    clickNext()

    await screen.findByLabelText(/additional information/i)
    clickNext()

    await screen.findByLabelText(/last 4 digits/i)
    clickNext()

    expect(await screen.findByLabelText(/last 4 digits/i)).toBeInTheDocument()
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument()
  })

  it('completes the full flow and includes machineId (from the URL query param) in the submitted payload', async () => {
    render(<ClaimFormBlock brands={brands} />)
    await completeAllSteps()

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          machineId: 'AK-0231',
          customerFirstName: 'Test',
          customerLastName: 'Prueba',
        }),
      )
    })
  })

  it('shows Refund Method/Account steps (not card digits) when Cash is selected, and includes them in the submitted payload', async () => {
    render(<ClaimFormBlock brands={brands} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    fireEvent.click(await screen.findByRole('radio', { name: "Carlo's Bakery" }))
    fireEvent.click(await screen.findByRole('radio', { name: /^cash$/i }))

    // Cash-only branch: "Did you see credits available?" — choose No to
    // continue into the regular refund flow instead of the terminal message.
    fireEvent.click(await screen.findByRole('radio', { name: /^no$/i }))
    await screen.findByText(/sorry to hear that/i)
    clickNext()

    fireEvent.change(await screen.findByLabelText(/first name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Prueba' } })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'hola@bepartnerlabs.com' },
    })
    clickNext()
    fireEvent.change(await screen.findByLabelText(/phone/i), { target: { value: '3055550100' } })
    clickNext()
    await screen.findByLabelText(/date and time/i)
    clickNext()
    fireEvent.change(await screen.findByLabelText(/where did the issue happen/i), {
      target: { value: 'BePartnerLabs Test Property, Doral, FL' },
    })
    clickNext()
    fireEvent.change(await screen.findByLabelText(/what happened/i), {
      target: { value: 'partial_dispense' },
    })
    clickNext()
    await screen.findByLabelText(/additional information/i)
    clickNext()

    // Cash branch: refund method + account instead of card digits.
    expect(screen.queryByLabelText(/last 4 digits/i)).toBeNull()
    fireEvent.click(await screen.findByRole('radio', { name: /zelle/i }))

    fireEvent.change(await screen.findByLabelText(/username\/email\/phone/i), {
      target: { value: 'refund@example.com' },
    })
    clickNext()

    await screen.findByText(/attach a picture/i)
    clickNext()

    await screen.findByText(/review your information/i)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ refundMethod: 'Zelle', refundAccount: 'refund@example.com' }),
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

describe('Previous button on the first step', () => {
  afterEach(cleanup)

  it('is visible on step 0 and returns to the intro screen', async () => {
    render(
      <ClaimFormBlock
        brands={brands}
        submitButtonLabel="Submit"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(await screen.findByRole('radio', { name: "Carlo's Bakery" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(await screen.findByRole('button', { name: /start/i })).toBeInTheDocument()
  })
})

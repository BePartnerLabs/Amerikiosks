import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const mutate = vi.fn()
let mutationState: {
  isPending: boolean
  isSuccess: boolean
  error: Error | null
} = { isPending: false, isSuccess: false, error: null }

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

let capturedMutationFn: ((data: unknown) => unknown) | undefined
vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn }: { mutationFn: (data: unknown) => unknown }) => {
    capturedMutationFn = mutationFn
    return {
      mutate,
      isPending: mutationState.isPending,
      isSuccess: mutationState.isSuccess,
      error: mutationState.error,
      reset: vi.fn(),
    }
  },
}))

const submitMock = vi.fn()
vi.mock('@/repositories', () => ({
  FormsRepository: { submit: (...args: unknown[]) => submitMock(...args) },
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

vi.mock('@/blocks/Form/fields', () => ({
  fields: {
    text: ({ name }: { name: string }) => (
      <input
        name={name}
        aria-label={name}
      />
    ),
  },
}))

import { FormBlock } from '@/blocks/Form/Component'

const baseForm = {
  id: 'form-1',
  submitButtonLabel: 'Send it',
  confirmationType: 'message' as const,
  confirmationMessage: {
    root: {
      type: 'root',
      children: [],
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
  fields: [{ blockType: 'text', name: 'email' }],
}

describe('FormBlock', () => {
  afterEach(() => {
    cleanup()
    mutate.mockClear()
    push.mockClear()
    mutationState = { isPending: false, isSuccess: false, error: null }
  })

  it('renders a field for each configured form field', () => {
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )
    expect(screen.getByLabelText('email')).toBeInTheDocument()
  })

  it('renders the submit button with the configured label', () => {
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )
    expect(screen.getByRole('button', { name: 'Send it' })).toBeInTheDocument()
  })

  it('renders the intro content when enableIntro is true and not yet submitted', () => {
    render(
      <FormBlock
        enableIntro={true}
        introContent={baseForm.confirmationMessage as never}
        form={baseForm as never}
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('does not render intro content when enableIntro is false', () => {
    render(
      <FormBlock
        enableIntro={false}
        introContent={baseForm.confirmationMessage as never}
        form={baseForm as never}
      />,
    )
    expect(screen.queryByTestId('richtext')).toBeNull()
  })

  it('shows a loading message while the mutation is pending', () => {
    mutationState = { isPending: true, isSuccess: false, error: null }
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('renders the confirmation message and hides the form once submitted', () => {
    mutationState = { isPending: false, isSuccess: true, error: null }
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
    expect(screen.queryByLabelText('email')).toBeNull()
  })

  it('carries data-ga-event="generate_lead" and the form title on the success node', () => {
    mutationState = { isPending: false, isSuccess: true, error: null }
    render(
      <FormBlock
        enableIntro={false}
        form={{ ...baseForm, title: 'Partnership Program' } as never}
      />,
    )
    const successNode = screen.getByTestId('form-block-success')
    expect(successNode).toHaveAttribute('data-ga-event', 'generate_lead')
    expect(successNode).toHaveAttribute('data-ga-form-name', 'Partnership Program')
  })

  it('shows an error message when the mutation fails', () => {
    mutationState = { isPending: false, isSuccess: false, error: new Error('Boom') }
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )
    expect(screen.getByText('submitError')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'retry' })).toBeInTheDocument()
  })

  // react-hook-form is seeded with `defaultValues: form.fields`, an array, so
  // the submitted data also carries numeric index keys whose values are whole
  // field-config objects. Sending those made the route reject every real
  // submission as containing undeclared fields — a 400 that only showed up
  // when a human actually filled the form in a browser.
  it('sends only the fields the form declares, not the array indices react-hook-form seeds', async () => {
    render(
      <FormBlock
        enableIntro={false}
        form={baseForm as never}
      />,
    )

    await capturedMutationFn?.({
      0: { blockType: 'text', name: 'email' },
      1: { blockType: 'text', name: 'ignored' },
      email: 'someone@example.com',
    })

    expect(submitMock).toHaveBeenCalledTimes(1)
    const [payload] = submitMock.mock.calls[0]
    expect(payload.submissionData).toEqual([{ field: 'email', value: 'someone@example.com' }])
  })

  // 'website' and 'date' were added to the rule engine but not to FormError's
  // known-code list, so both fell back to "This field is required" — a wrong
  // message is worse than a generic one, because it sends the visitor looking
  // in the wrong place.
  it('translates every code the rule engine can return', async () => {
    const { KNOWN_ERROR_CODES } = await import('@/blocks/Form/Error')
    const messages = (await import('@/messages/en.json')).default

    for (const code of KNOWN_ERROR_CODES) {
      expect(messages.form.errors).toHaveProperty(code)
    }
  })
})

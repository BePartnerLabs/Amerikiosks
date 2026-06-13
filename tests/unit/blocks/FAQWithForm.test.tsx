import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FAQWithFormBlock } from '@/blocks/FAQWithForm/Component'
import type { FAQWithFormBlock as FAQWithFormBlockType, FaqItem } from '@/payload-types'

vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/blocks/Form/Component', () => ({
  FormBlock: ({ form }: { form: FormType }) => (
    <div data-testid="form-block">{form.submitButtonLabel}</div>
  ),
}))
vi.mock('@/components/SectionHeader', () => ({
  SectionHeader: ({ heading }: { heading: string }) => <h2>{heading}</h2>,
}))

const makeFaqItem = (id: string, question: string): FaqItem =>
  ({
    id,
    question,
    answer: {
      root: {
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [{ text: `Answer to ${question}`, type: 'text', version: 1 }],
          },
        ],
        type: 'root',
        version: 1,
      },
    },
    weight: 10,
    tags: [{ label: 'brands', id: 't1' }],
    updatedAt: '',
    createdAt: '',
  }) as unknown as FaqItem

const resolvedForm = {
  id: 'form-1',
  title: 'Brand Program Form',
  submitButtonLabel: 'Submit Brand Program Request',
  confirmationType: 'message',
  fields: [],
} as unknown as FormType

const base: FAQWithFormBlockType & { resolvedFaqs: FaqItem[]; resolvedForm: FormType } = {
  blockType: 'faqWithForm',
  blockName: 'Start A Program',
  id: 'fwf-1',
  heading: 'Answers before your brand shows up.',
  filterTags: [{ tag: 'brands', id: 'ft1' }],
  form: 1,
  resolvedFaqs: [
    makeFaqItem('faq-1', 'Do we control pricing?'),
    makeFaqItem('faq-2', 'Who handles replenishment?'),
  ],
  resolvedForm,
}

describe('FAQWithFormBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByRole('region', { name: /answers before/i })).toBeInTheDocument()
  })

  it('renders main heading', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Answers before your brand shows up.',
    )
  })

  it('renders FAQ questions as summary elements', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByText('Do we control pricing?')).toBeInTheDocument()
    expect(screen.getByText('Who handles replenishment?')).toBeInTheDocument()
  })

  it('renders FormBlock when resolvedForm is provided', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByTestId('form-block')).toBeInTheDocument()
    expect(screen.getByText('Submit Brand Program Request')).toBeInTheDocument()
  })

  it('renders nothing for form panel when resolvedForm is absent', () => {
    const { container } = render(
      <FAQWithFormBlock
        {...base}
        resolvedForm={undefined as unknown as FormType}
      />,
    )
    expect(container.querySelector('[data-testid="form-block"]')).toBeNull()
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<FAQWithFormBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('faq_with_form')
    expect(section?.getAttribute('data-ga-section')).toBe('Start A Program')
  })

  it('renders FAQ summaries with ga-event attribute', () => {
    const { container } = render(<FAQWithFormBlock {...base} />)
    const summaries = container.querySelectorAll('summary')
    for (const summary of summaries) {
      expect(summary.getAttribute('data-ga-event')).toBe('faq_expand')
    }
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(
      <FAQWithFormBlock
        {...base}
        heading={undefined as unknown as string}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})

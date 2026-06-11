import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProcessStepsBlock } from '@/blocks/ProcessSteps/Component'
import type { ProcessStepsBlock as ProcessStepsBlockType } from '@/payload-types'

const base: ProcessStepsBlockType = {
  blockType: 'processSteps',
  blockName: 'How It Works',
  id: 'ps-1',
  eyebrow: 'HOW IT WORKS',
  heading: 'From first opportunity to daily operation.',
  steps: [
    {
      id: 's1',
      title: 'Define the moment',
      body: {
        root: { children: [], type: 'root', version: 1 },
      } as unknown as ProcessStepsBlockType['steps'][number]['body'],
    },
    {
      id: 's2',
      title: 'Match the context',
      body: {
        root: { children: [], type: 'root', version: 1 },
      } as unknown as ProcessStepsBlockType['steps'][number]['body'],
    },
  ],
}

describe('ProcessStepsBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('region', { name: /from first opportunity/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'From first opportunity to daily operation.',
    )
  })

  it('renders steps as an ordered list', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('renders step titles', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByText('Define the moment')).toBeInTheDocument()
    expect(screen.getByText('Match the context')).toBeInTheDocument()
  })

  it('each list item has aria-label with step number and title', () => {
    render(<ProcessStepsBlock {...base} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('aria-label', 'Step 1: Define the moment')
    expect(items[1]).toHaveAttribute('aria-label', 'Step 2: Match the context')
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<ProcessStepsBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('process_steps')
    expect(section?.getAttribute('data-ga-section')).toBe('How It Works')
  })

  it('renders CTA link with ga-event when cta is provided', () => {
    const withCta: ProcessStepsBlockType = {
      ...base,
      cta: [
        {
          link: {
            label: 'Start a Brand Program',
            url: '/contact',
            type: 'custom',
            appearance: 'default',
          },
          id: 'cta-1',
        },
      ],
    }
    render(<ProcessStepsBlock {...withCta} />)
    const link = screen.getByRole('link', { name: /start a brand program/i })
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('data-ga-event')).toBe('cta_click')
    expect(link.getAttribute('data-ga-label')).toBe('Start a Brand Program')
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(
      <ProcessStepsBlock
        {...base}
        heading={undefined as unknown as string}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})

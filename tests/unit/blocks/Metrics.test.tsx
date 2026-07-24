import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MetricsBlock } from '@/blocks/Metrics/Component'
import type { MetricsBlock as MetricsBlockType } from '@/payload-types'

const base: MetricsBlockType = {
  blockType: 'metrics',
  blockName: 'Metrics — Home',
  id: 'm-1',
  heading: 'We connect brands with people in the moments that matter most',
  items: [
    { id: 's1', value: '10+', label: 'Years of Industry Experience' },
    { id: 's2', value: '1000+', label: 'Active Kiosks Deployed' },
  ],
}

describe('MetricsBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label', () => {
    render(<MetricsBlock {...base} />)
    expect(
      screen.getByRole('region', { name: /we connect brands with people/i }),
    ).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<MetricsBlock {...base} />)
    expect(
      screen.getByRole('heading', { name: /we connect brands with people/i }),
    ).toBeInTheDocument()
  })

  it('renders eyebrow when provided', () => {
    render(
      <MetricsBlock
        {...base}
        eyebrow="WHY AMERIKIOSKS"
      />,
    )
    expect(screen.getByText('WHY AMERIKIOSKS')).toBeInTheDocument()
  })

  it('renders all stat labels', () => {
    render(<MetricsBlock {...base} />)
    expect(screen.getByText('Years of Industry Experience')).toBeInTheDocument()
    expect(screen.getByText('Active Kiosks Deployed')).toBeInTheDocument()
  })

  it('renders the correct number of stats', () => {
    const { container } = render(<MetricsBlock {...base} />)
    expect(container.querySelectorAll('.ak-metrics__stat')).toHaveLength(2)
  })

  it('sets data-ga-block from the block type', () => {
    const { container } = render(<MetricsBlock {...base} />)
    expect(container.querySelector('.ak-metrics')).toHaveAttribute('data-ga-block', 'metrics')
  })

  it('returns null when there is no heading and no items', () => {
    const { container } = render(
      <MetricsBlock
        {...base}
        heading=""
        items={[]}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('does not render a CTA button when link label/url are missing', () => {
    render(<MetricsBlock {...base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the CTA button when link label and url are present', () => {
    render(
      <MetricsBlock
        {...base}
        link={{ label: 'Build Your Retail Experience', url: '/contact', type: 'custom' }}
      />,
    )
    expect(screen.getByRole('link', { name: /build your retail experience/i })).toHaveAttribute(
      'href',
      '/contact',
    )
  })
})

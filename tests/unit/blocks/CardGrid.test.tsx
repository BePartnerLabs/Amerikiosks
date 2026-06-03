import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/RichText', () => ({
  default: ({ data: _data }: { data: unknown }) => <div data-testid="richtext" />,
}))

import { CardGridBlock } from '@/blocks/CardGrid/Component'
import type { CardGridBlock as CardGridBlockType } from '@/payload-types'

const base: CardGridBlockType = {
  blockType: 'cardGrid',
  blockName: 'Card Grid — Home',
  id: 'cg-1',
  variant: 'compact',
  heading: 'Why Amerikiosks',
  items: [
    { id: 'i1', title: 'Premium Locations', body: null },
    { id: 'i2', title: 'Turnkey Operation', body: null },
  ],
}

describe('CardGridBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label', () => {
    render(<CardGridBlock {...base} />)
    expect(screen.getByRole('region', { name: /why amerikiosks/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<CardGridBlock {...base} />)
    expect(screen.getByRole('heading', { name: /why amerikiosks/i })).toBeInTheDocument()
  })

  it('renders all card titles', () => {
    render(<CardGridBlock {...base} />)
    expect(screen.getByText('Premium Locations')).toBeInTheDocument()
    expect(screen.getByText('Turnkey Operation')).toBeInTheDocument()
  })

  it('renders Schema.org JSON-LD', () => {
    const { container } = render(<CardGridBlock {...base} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('ItemList')
    expect(data.name).toBe('Why Amerikiosks')
    expect(data.numberOfItems).toBe(2)
  })

  it('returns null when no heading and no items', () => {
    const { container } = render(
      <CardGridBlock
        {...base}
        heading=""
        items={[]}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders correct number of cards', () => {
    const { container } = render(<CardGridBlock {...base} />)
    expect(container.querySelectorAll('.ak-card-grid__card')).toHaveLength(2)
  })

  it('renders eyebrow when provided', () => {
    render(
      <CardGridBlock
        {...base}
        eyebrow="WHERE IT WORKS"
      />,
    )
    expect(screen.getByText('WHERE IT WORKS')).toBeInTheDocument()
  })

  it('renders pillar variant with subheading and card eyebrow', () => {
    render(
      <CardGridBlock
        {...base}
        variant="pillar"
        subheading="From first opportunity to daily operation."
        items={[{ id: 'i1', title: 'Define the moment', eyebrow: 'STRATEGY', body: null }]}
      />,
    )
    expect(screen.getByText('From first opportunity to daily operation.')).toBeInTheDocument()
    expect(screen.getByText('STRATEGY')).toBeInTheDocument()
  })
})

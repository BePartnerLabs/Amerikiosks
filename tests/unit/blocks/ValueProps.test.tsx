import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/RichText', () => ({
  default: ({ data: _data }: { data: unknown }) => <div data-testid="richtext" />,
}))

import { ValuePropsBlock } from '@/blocks/ValueProps/Component'
import type { Page } from '@/payload-types'

type ValuePropsType = Extract<NonNullable<Page['layout']>[number], { blockType: 'valueProps' }>

const base: ValuePropsType = {
  blockType: 'valueProps',
  blockName: '',
  id: 'vp-1',
  heading: 'Why Amerikiosks',
  items: [
    { id: 'i1', title: 'Premium Locations', body: null },
    { id: 'i2', title: 'Turnkey Operation', body: null },
  ],
}

describe('ValuePropsBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label', () => {
    render(<ValuePropsBlock {...base} />)
    expect(screen.getByRole('region', { name: /why amerikiosks/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<ValuePropsBlock {...base} />)
    expect(screen.getByRole('heading', { name: /why amerikiosks/i })).toBeInTheDocument()
  })

  it('renders all card titles', () => {
    render(<ValuePropsBlock {...base} />)
    expect(screen.getByText('Premium Locations')).toBeInTheDocument()
    expect(screen.getByText('Turnkey Operation')).toBeInTheDocument()
  })

  it('renders Schema.org JSON-LD', () => {
    const { container } = render(<ValuePropsBlock {...base} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse(script?.innerHTML ?? '{}')
    expect(data['@type']).toBe('ItemList')
    expect(data.name).toBe('Why Amerikiosks')
    expect(data.numberOfItems).toBe(2)
  })

  it('returns null when no heading and no items', () => {
    const { container } = render(
      <ValuePropsBlock
        {...base}
        heading=""
        items={[]}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders correct number of cards', () => {
    const { container } = render(<ValuePropsBlock {...base} />)
    expect(container.querySelectorAll('.ak-value-props__card')).toHaveLength(2)
  })
})

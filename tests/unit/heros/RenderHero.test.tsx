import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/heros/HighImpact', () => ({
  HighImpactHero: () => <div data-testid="high-impact" />,
}))
vi.mock('@/heros/LowImpact', () => ({
  LowImpactHero: () => <div data-testid="low-impact" />,
}))
vi.mock('@/heros/MediumImpact', () => ({
  MediumImpactHero: () => <div data-testid="medium-impact" />,
}))
vi.mock('@/heros/Simple', () => ({
  SimpleHero: () => <div data-testid="simple" />,
}))

import { RenderHero } from '@/heros/RenderHero'
import type { Page } from '@/payload-types'

describe('RenderHero', () => {
  afterEach(cleanup)

  it('renders nothing when type is "none"', () => {
    const { container } = render(<RenderHero type="none" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when type is missing', () => {
    const { container } = render(<RenderHero type={undefined as unknown as Page['hero']['type']} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders HighImpactHero for type "highImpact"', () => {
    render(<RenderHero type="highImpact" />)
    expect(screen.getByTestId('high-impact')).toBeInTheDocument()
  })

  it('renders LowImpactHero for type "lowImpact"', () => {
    render(<RenderHero type="lowImpact" />)
    expect(screen.getByTestId('low-impact')).toBeInTheDocument()
  })

  it('renders MediumImpactHero for type "mediumImpact"', () => {
    render(<RenderHero type="mediumImpact" />)
    expect(screen.getByTestId('medium-impact')).toBeInTheDocument()
  })

  it('renders SimpleHero for type "simple"', () => {
    render(<RenderHero type="simple" />)
    expect(screen.getByTestId('simple')).toBeInTheDocument()
  })
})

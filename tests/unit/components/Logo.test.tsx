import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Logo } from '@/components/Logo/Logo'

describe('Logo', () => {
  afterEach(cleanup)

  it('renders an accessible SVG logo', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'Amerikiosks' })).toBeInTheDocument()
  })

  it('defaults to lazy loading and low priority', () => {
    const { container } = render(<Logo />)
    const img = container.querySelector('img.logo-mobile')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('applies eager loading and high priority when provided', () => {
    const { container } = render(
      <Logo
        loading="eager"
        priority="high"
      />,
    )
    const img = container.querySelector('img.logo-mobile')
    expect(img).toHaveAttribute('loading', 'eager')
  })
})

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Logo } from '@/components/Logo/Logo'

describe('Logo', () => {
  afterEach(cleanup)

  it('renders both marks as accessible inline SVGs', () => {
    render(<Logo />)
    // One for each breakpoint; CSS shows exactly one at a time.
    expect(screen.getAllByRole('img', { name: 'Amerikiosks' })).toHaveLength(2)
  })

  it('gives the mobile mark the same Bracket Lock animation hooks as desktop', () => {
    const { container } = render(<Logo />)
    const mobile = container.querySelector('svg.logo-mobile')

    expect(mobile).toBeInTheDocument()
    // Previously a next/image of logo-1.svg, which the animation could not
    // reach inside — that is the regression these assertions guard.
    expect(container.querySelector('img.logo-mobile')).toBeNull()
    expect(mobile?.querySelector('.logo-mark-left')).toBeInTheDocument()
    expect(mobile?.querySelector('.logo-mark-core')).toBeInTheDocument()
    expect(mobile?.querySelector('.logo-mark-right')).toBeInTheDocument()
  })
})

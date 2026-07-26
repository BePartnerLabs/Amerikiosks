import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ZoomFadeHero } from '@/components/MachineHero/ZoomFadeHero'

describe('ZoomFadeHero', () => {
  afterEach(cleanup)

  const baseProps = {
    imageUrl: '/gamma-13.jpg',
    alt: 'Gamma 13',
    eyebrow: 'NEXT GENERATION',
    heading: 'GAMMA 13 MODEL',
    subtitle: 'A premium high-capacity vending solution.',
    cta: {
      type: 'custom' as const,
      url: '/contact',
      label: 'Contact Sales',
      appearance: 'outline' as const,
    },
  }

  it('renders eyebrow, heading, and subtitle', () => {
    render(
      <ZoomFadeHero
        {...baseProps}
        brochureUrl={null}
      />,
    )
    expect(screen.getByText('NEXT GENERATION')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'GAMMA 13 MODEL' })).toBeInTheDocument()
    expect(screen.getByText('A premium high-capacity vending solution.')).toBeInTheDocument()
  })

  it('renders both buttons when brochureUrl is set', () => {
    render(
      <ZoomFadeHero
        {...baseProps}
        brochureUrl="/gamma-13-brochure.pdf"
      />,
    )
    expect(screen.getByRole('link', { name: 'Download brochure' })).toHaveAttribute(
      'href',
      '/gamma-13-brochure.pdf',
    )
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toHaveAttribute('href', '/contact')
  })

  it('renders only the Contact Sales link when brochureUrl is null', () => {
    render(
      <ZoomFadeHero
        {...baseProps}
        brochureUrl={null}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Download brochure' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toBeInTheDocument()
  })
})

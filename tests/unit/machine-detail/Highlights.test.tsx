import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Highlights } from '@/app/(frontend)/[locale]/machines/[family]/[slug]/Highlights'

describe('Highlights', () => {
  afterEach(cleanup)

  it('renders eyebrow, heading, and each item', () => {
    render(
      <Highlights
        highlights={{
          eyebrow: 'WHY GAMMA 13',
          heading: 'Engineered for performance. Designed for any location.',
          items: [
            {
              icon: 'inventory_2',
              title: 'High Capacity',
              description: '800-1,100 products across 90 SKUs.',
            },
            {
              icon: 'monitor',
              title: '22" Touch Screen',
              description: 'Intuitive interface for customers.',
            },
          ],
        }}
      />,
    )
    expect(screen.getByText('WHY GAMMA 13')).toBeInTheDocument()
    expect(
      screen.getByText('Engineered for performance. Designed for any location.'),
    ).toBeInTheDocument()
    expect(screen.getByText('High Capacity')).toBeInTheDocument()
    expect(screen.getByText('800-1,100 products across 90 SKUs.')).toBeInTheDocument()
    expect(screen.getByText('22" Touch Screen')).toBeInTheDocument()
  })
})

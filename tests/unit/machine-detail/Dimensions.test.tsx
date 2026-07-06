import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Dimensions } from '@/app/(frontend)/[locale]/machines/[slug]/Dimensions'

describe('Dimensions', () => {
  afterEach(cleanup)

  it('renders each diagram with its label, the dimensions values, and the fixed caption', () => {
    render(
      <Dimensions
        diagrams={[
          {
            id: 'd1',
            image: {
              id: 1,
              url: '/front.png',
              updatedAt: '2024-01-01T00:00:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            label: 'Front view',
          },
          {
            id: 'd2',
            image: {
              id: 2,
              url: '/side.png',
              updatedAt: '2024-01-01T00:00:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            label: 'Side view',
          },
        ]}
        dimensions={{ height: '92"', width: '74"', depth: '40"' }}
      />,
    )
    expect(screen.getByText('DIMENSIONS')).toBeInTheDocument()
    expect(screen.getByText('Front view')).toBeInTheDocument()
    expect(screen.getByText('Side view')).toBeInTheDocument()
    expect(screen.getByText('92"')).toBeInTheDocument()
    expect(screen.getByText('74"')).toBeInTheDocument()
    expect(screen.getByText('40"')).toBeInTheDocument()
    expect(screen.getByText('Dimensions are approximate and may vary.')).toBeInTheDocument()
  })
})

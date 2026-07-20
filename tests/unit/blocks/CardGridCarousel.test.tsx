import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CardGridCarousel } from '@/blocks/CardGrid/CarouselNav'

describe('CardGridCarousel', () => {
  afterEach(cleanup)

  it('renders children inside the scroll track', () => {
    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
        <div className="ak-card-grid__card">Card B</div>
      </CardGridCarousel>,
    )
    expect(screen.getByText('Card A')).toBeInTheDocument()
    expect(screen.getByText('Card B')).toBeInTheDocument()
  })

  it('renders Previous and Next buttons', () => {
    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('scrolls the track forward when Next is clicked', () => {
    const scrollBySpy = vi.fn()
    HTMLElement.prototype.scrollBy = scrollBySpy
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(scrollBySpy).toHaveBeenCalledTimes(1)
    const arg = scrollBySpy.mock.calls[0][0]
    expect(arg.left).toBeGreaterThan(0)
  })

  it('scrolls the track backward when Previous is clicked', () => {
    const scrollBySpy = vi.fn()
    HTMLElement.prototype.scrollBy = scrollBySpy
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(scrollBySpy).toHaveBeenCalledTimes(1)
    const arg = scrollBySpy.mock.calls[0][0]
    expect(arg.left).toBeLessThan(0)
  })
})

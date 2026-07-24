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
    const scrollToSpy = vi.fn()
    HTMLElement.prototype.scrollTo = scrollToSpy
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1200,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 })

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(scrollToSpy).toHaveBeenCalledTimes(1)
    const arg = scrollToSpy.mock.calls[0][0]
    expect(arg.left).toBeGreaterThan(0)
  })

  it('scrolls the track backward when Previous is clicked', () => {
    const scrollToSpy = vi.fn()
    HTMLElement.prototype.scrollTo = scrollToSpy
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1200,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 500,
    })

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(scrollToSpy).toHaveBeenCalledTimes(1)
    const arg = scrollToSpy.mock.calls[0][0]
    expect(arg.left).toBeLessThan(500)
  })

  it('clamps the scroll target to the max scrollable width instead of overshooting past the last card', () => {
    const scrollToSpy = vi.fn()
    HTMLElement.prototype.scrollTo = scrollToSpy
    // Card is wider than the remaining scrollable distance — a naive
    // scrollLeft + cardWidth would overshoot past the true max.
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 550,
    })

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(scrollToSpy).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' })
  })

  it('clamps the scroll target to 0 instead of scrolling past the first card', () => {
    const scrollToSpy = vi.fn()
    HTMLElement.prototype.scrollTo = scrollToSpy
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 300 }) as DOMRect)
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 100,
    })

    render(
      <CardGridCarousel>
        <div className="ak-card-grid__card">Card A</div>
      </CardGridCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(scrollToSpy).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })
})

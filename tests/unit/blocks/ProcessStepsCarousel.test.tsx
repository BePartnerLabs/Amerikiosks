import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProcessStepsCarousel } from '@/blocks/ProcessSteps/CarouselNav'

describe('ProcessStepsCarousel', () => {
  afterEach(cleanup)

  it('clamps the scroll target to the max scrollable width instead of overshooting past the last item', () => {
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
      value: 550,
    })

    render(
      <ProcessStepsCarousel>
        <li className="ak-process-steps__item">Step A</li>
      </ProcessStepsCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(scrollToSpy).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' })
  })

  it('clamps the scroll target to 0 instead of scrolling past the first item', () => {
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
      <ProcessStepsCarousel>
        <li className="ak-process-steps__item">Step A</li>
      </ProcessStepsCarousel>,
    )
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(scrollToSpy).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })
})

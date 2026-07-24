import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MetricsCounter } from '@/blocks/Metrics/MetricsCounter'

let observedCallback: IntersectionObserverCallback | null = null
let observedElement: Element | null = null

class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observedCallback = callback
  }
  observe(el: Element) {
    observedElement = el
  }
  unobserve() {}
  disconnect() {}
}

function fireIntersect(isIntersecting: boolean) {
  if (!observedCallback || !observedElement) throw new Error('observer not attached')
  observedCallback(
    [{ isIntersecting, target: observedElement } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  )
}

describe('MetricsCounter', () => {
  beforeEach(() => {
    observedCallback = null
    observedElement = null
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    let now = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      now += 100
      cb(now)
      return now
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the static value before entering the viewport', () => {
    render(<MetricsCounter value="10+" />)
    expect(screen.getByText(/^0\+?$/)).toBeInTheDocument()
  })

  it('renders the final numeric value once fully animated after intersecting', () => {
    render(<MetricsCounter value="10+" />)
    act(() => fireIntersect(true))
    expect(screen.getByText('10+')).toBeInTheDocument()
  })

  it('preserves a non-numeric suffix like "+" on the final value', () => {
    render(<MetricsCounter value="20+" />)
    act(() => fireIntersect(true))
    expect(screen.getByText('20+')).toBeInTheDocument()
  })

  it('starts from 60% of target for 3+ digit numbers instead of animating from 0', () => {
    render(<MetricsCounter value="1000+" />)
    act(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementationOnce(
        (cb: FrameRequestCallback) => {
          cb(1)
          return 1
        },
      )
      fireIntersect(true)
    })
    const text = screen.getByText(/^\d+\+?$/).textContent ?? ''
    const shown = Number.parseInt(text, 10)
    expect(shown).toBeGreaterThanOrEqual(600)
  })

  it('renders non-numeric values as static text without animating', () => {
    render(<MetricsCounter value="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('does not crash when value is undefined (e.g. a freshly-added admin array row)', () => {
    const { container } = render(<MetricsCounter value={undefined as unknown as string} />)
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('renders the final value immediately when prefers-reduced-motion is set', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    render(<MetricsCounter value="30" />)
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})

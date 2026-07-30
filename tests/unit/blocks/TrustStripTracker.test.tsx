import { cleanup, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TrustStripTracker } from '@/blocks/TrustStrip/Tracker'

// The tracker counts real card elements to report partner_count. We inject the
// fixture markup via raw HTML (rather than JSX `<img>`, which the repo's
// next/image lint plugin forbids) since these are inert test fixtures.
const cardHtml = (alt: string) =>
  `<li class="ak-trust-strip__card"><img alt="${alt}" src="/${alt.toLowerCase()}.png" /></li>`

describe('TrustStripTracker', () => {
  afterEach(cleanup)

  let observeSpy: ReturnType<typeof vi.fn>
  let disconnectSpy: ReturnType<typeof vi.fn>
  let observerCallback: IntersectionObserverCallback | null = null

  beforeEach(() => {
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()
    observerCallback = null

    globalThis.IntersectionObserver = vi.fn(function (
      this: unknown,
      callback: IntersectionObserverCallback,
    ) {
      observerCallback = callback
      return {
        observe: observeSpy,
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      }
    }) as unknown as typeof IntersectionObserver
  })

  const renderTracker = () => {
    const containerRef = createRef<HTMLDivElement>()
    const { container, unmount } = render(
      <div ref={containerRef}>
        <ul
          className="ak-trust-strip__track"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static test fixture, not user input
          dangerouslySetInnerHTML={{ __html: cardHtml('Hilton') + cardHtml('Marriott') }}
        />
        <ul
          className="ak-trust-strip__track"
          aria-hidden="true"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static test fixture, not user input
          dangerouslySetInnerHTML={{ __html: cardHtml('Hilton') + cardHtml('Marriott') }}
        />
        <TrustStripTracker containerRef={containerRef} />
      </div>,
    )

    const strip = containerRef.current as Element

    return { container, containerRef, strip, unmount }
  }

  const enterThenLeave = (strip: Element, from: number, to: number) => {
    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(from)
    observerCallback?.(
      [{ target: strip, isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    now.mockReturnValue(to)
    observerCallback?.(
      [{ target: strip, isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    now.mockRestore()
  }

  it('does nothing when the container ref is empty', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(<TrustStripTracker containerRef={containerRef} />)
    expect(observeSpy).not.toHaveBeenCalled()
  })

  // The whole point of the rewrite: one observed element (the strip), not one
  // per logo. Four cards are in the fixture; only the container is observed.
  it('observes the strip itself, not each card', () => {
    renderTracker()
    expect(observeSpy).toHaveBeenCalledTimes(1)
  })

  it('fires one trust_strip_dwell event when the strip leaves the viewport', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { strip } = renderTracker()
    enterThenLeave(strip, 1000, 3000)

    expect(gtagSpy).toHaveBeenCalledTimes(1)
    expect(gtagSpy).toHaveBeenCalledWith('event', 'trust_strip_dwell', {
      dwell_seconds: 2,
      // Counted from the visible track only — the aria-hidden duplicate must
      // not double it.
      partner_count: 2,
      section: 'trust_strip',
    })

    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  // The runaway this rewrite exists to prevent, one level up: a long page where
  // the strip scrolls in and out repeatedly must still report once.
  it('reports at most once per page view', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { strip } = renderTracker()
    enterThenLeave(strip, 1000, 3000)
    enterThenLeave(strip, 5000, 9000)

    expect(gtagSpy).toHaveBeenCalledTimes(1)
    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  it('does not fire when the strip leaves before ever entering', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { strip } = renderTracker()
    observerCallback?.(
      [{ target: strip, isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(gtagSpy).not.toHaveBeenCalled()
    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  // A visitor who scrolls to the strip and stops there is the most engaged
  // case and never triggers an exit — reporting on teardown is what keeps it
  // from being the one that goes missing.
  it('reports on unmount when the strip never left the viewport', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { strip, unmount } = renderTracker()

    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    observerCallback?.(
      [{ target: strip, isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    now.mockReturnValue(4000)
    unmount()
    now.mockRestore()

    expect(gtagSpy).toHaveBeenCalledWith(
      'event',
      'trust_strip_dwell',
      expect.objectContaining({ dwell_seconds: 3 }),
    )
    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderTracker()
    expect(disconnectSpy).not.toHaveBeenCalled()
    unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})

import { cleanup, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TrustStripTracker } from '@/blocks/TrustStrip/Tracker'

// Tracker.tsx queries the DOM for a real <img> element to read its `alt`
// attribute. We inject the fixture markup via raw HTML (rather than JSX
// `<img>`, which the repo's next/image lint plugin forbids) since these are
// inert test fixtures, not rendered UI.
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
    const { container } = render(
      <div ref={containerRef}>
        <ul
          className="ak-trust-strip__track"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static test fixture, not user input
          dangerouslySetInnerHTML={{ __html: cardHtml('Hilton') }}
        />
        <ul
          className="ak-trust-strip__track"
          aria-hidden="true"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static test fixture, not user input
          dangerouslySetInnerHTML={{ __html: cardHtml('Hilton') }}
        />
        <TrustStripTracker containerRef={containerRef} />
      </div>,
    )

    const card = container.querySelector('.ak-trust-strip__card') as Element

    return { container, containerRef, card }
  }

  it('does nothing when the container ref is empty', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(<TrustStripTracker containerRef={containerRef} />)
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('observes only cards in the first (non-duplicate) track', () => {
    renderTracker()
    expect(observeSpy).toHaveBeenCalledTimes(1)
  })

  it('fires a gtag partner_logo_dwell event with dwell time when a card leaves the viewport', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { card } = renderTracker()

    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    observerCallback?.(
      [{ target: card, isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    now.mockReturnValue(3000)
    observerCallback?.(
      [{ target: card, isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(gtagSpy).toHaveBeenCalledWith('event', 'partner_logo_dwell', {
      partner_name: 'Hilton',
      dwell_seconds: 2,
      section: 'trust_strip',
    })

    now.mockRestore()
    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  it('does not fire an event when a card leaves before ever fully entering', () => {
    const gtagSpy = vi.fn()
    ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

    const { card } = renderTracker()

    observerCallback?.(
      [{ target: card, isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(gtagSpy).not.toHaveBeenCalled()
    delete (window as unknown as { gtag?: typeof gtagSpy }).gtag
  })

  it('disconnects the observer on unmount', () => {
    const containerRef = createRef<HTMLDivElement>()
    const { unmount } = render(
      <div ref={containerRef}>
        <ul
          className="ak-trust-strip__track"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static test fixture, not user input
          dangerouslySetInnerHTML={{ __html: cardHtml('X') }}
        />
        <TrustStripTracker containerRef={containerRef} />
      </div>,
    )
    expect(disconnectSpy).not.toHaveBeenCalled()
    unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})

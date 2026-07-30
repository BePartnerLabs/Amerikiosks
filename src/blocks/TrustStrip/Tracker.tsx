'use client'

import { useEffect, useRef } from 'react'

type Gtag = (command: 'event', eventName: string, params: Record<string, unknown>) => void

/**
 * One `trust_strip_dwell` event per page view, measuring how long the strip as a
 * whole was on screen.
 *
 * It used to fire per partner logo, which is what made `partner_logo_dwell` 80%
 * of every event in the property. Deduping per partner capped the volume but
 * kept the wrong shape: the strip is an autoplaying marquee, so every logo is on
 * screen for however long the animation takes and no longer. That number
 * measures the CSS, not the visitor — it cannot say which partner anyone
 * actually looked at, however it is aggregated. One strip-level event keeps the
 * only signal that was ever real (was this section seen, and for how long).
 */
export const TrustStripTracker: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>
}> = ({ containerRef }) => {
  const enteredAt = useRef<number | null>(null)
  // At most once per page view. Without this, scrolling the strip in and out on
  // a long page would send an event per pass — the same runaway as before, one
  // level up.
  const reported = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const send = () => {
      if (reported.current || enteredAt.current === null) return
      const dwell_seconds = Math.round((Date.now() - enteredAt.current) / 1000)
      enteredAt.current = null
      if (dwell_seconds <= 0) return
      const g = (window as Window & { gtag?: Gtag }).gtag
      if (typeof g !== 'function') return
      reported.current = true
      g('event', 'trust_strip_dwell', {
        dwell_seconds,
        partner_count: container.querySelectorAll(
          '.ak-trust-strip__track:not([aria-hidden]) .ak-trust-strip__card',
        ).length,
        section: 'trust_strip',
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            enteredAt.current ??= Date.now()
          } else {
            send()
          }
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(container)

    // Someone who scrolls to the strip and stays there never triggers an exit —
    // and that is the most engaged case, so it must not be the one that goes
    // unreported. `pagehide` covers leaving the site; the cleanup covers a
    // client-side route change, which fires no unload event at all.
    window.addEventListener('pagehide', send)
    return () => {
      send()
      window.removeEventListener('pagehide', send)
      observer.disconnect()
    }
  }, [containerRef])

  return null
}

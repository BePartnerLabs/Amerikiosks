'use client'

import { useEffect, useRef } from 'react'

type Gtag = (command: 'event', eventName: string, params: Record<string, unknown>) => void

export const TrustStripTracker: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>
}> = ({ containerRef }) => {
  const entryTimes = useRef<Map<Element, number>>(new Map())
  // The strip is an infinite marquee, so every card re-enters and re-exits the
  // viewport every few seconds. Without this, one visitor generated hundreds of
  // partner_logo_dwell events — 84% of all events in the property. One event per
  // partner per page view is all the signal there ever was.
  const reported = useRef<Set<string>>(new Set())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Only observe the first track (second is aria-hidden duplicate)
    const firstTrack = container.querySelector('.ak-trust-strip__track')
    if (!firstTrack) return

    const cards = Array.from(firstTrack.querySelectorAll('.ak-trust-strip__card'))

    const observer = new IntersectionObserver(
      (entries) => {
        const g = (window as Window & { gtag?: Gtag }).gtag
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entryTimes.current.set(entry.target, Date.now())
          } else {
            const entered = entryTimes.current.get(entry.target)
            if (entered) {
              const dwell_seconds = Math.round((Date.now() - entered) / 1000)
              entryTimes.current.delete(entry.target)
              if (dwell_seconds > 0 && typeof g === 'function') {
                const name = entry.target.querySelector('img')?.getAttribute('alt') ?? 'unknown'
                if (reported.current.has(name)) continue
                reported.current.add(name)
                g('event', 'partner_logo_dwell', {
                  partner_name: name,
                  dwell_seconds,
                  section: 'trust_strip',
                })
              }
            }
          }
        }
      },
      { threshold: 0.5 },
    )

    for (const card of cards) observer.observe(card)
    return () => observer.disconnect()
  }, [containerRef])

  return null
}

'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Icon } from '@/components/Icon'

const ITEM_SELECTOR = '.ak-process-steps__item'

export const ProcessStepsCarousel: React.FC<{ children: ReactNode }> = ({ children }) => {
  const trackRef = useRef<HTMLOListElement>(null)

  const scrollByStep = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const item = track.querySelector<HTMLElement>(ITEM_SELECTOR)
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const amount = item ? item.getBoundingClientRect().width + gap : track.clientWidth
    // Clamp to the real scrollable range — a fixed per-click increment can
    // request a target past the last item (or before the first), leaving
    // blank overscroll space instead of settling on the final item.
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const target = Math.min(Math.max(track.scrollLeft + amount * direction, 0), maxScrollLeft)
    track.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <div className="ak-process-steps__carousel">
      <ol
        ref={trackRef}
        className="ak-process-steps__list"
      >
        {children}
      </ol>
      <div className="ak-process-steps__carousel-nav">
        <button
          type="button"
          aria-label="Previous"
          className="ak-process-steps__carousel-btn"
          onClick={() => scrollByStep(-1)}
        >
          <Icon
            name="arrow_back_ios"
            size={16}
          />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="ak-process-steps__carousel-btn"
          onClick={() => scrollByStep(1)}
        >
          <Icon
            name="arrow_forward_ios"
            size={16}
          />
        </button>
      </div>
    </div>
  )
}

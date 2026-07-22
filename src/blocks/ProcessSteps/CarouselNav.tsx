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
    track.scrollBy({ left: amount * direction, behavior: 'smooth' })
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

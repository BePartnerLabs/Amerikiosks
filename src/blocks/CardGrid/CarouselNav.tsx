'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Icon } from '@/components/Icon'

const CARD_SELECTOR = '.ak-card-grid__card'

export const CardGridCarousel: React.FC<{ children: ReactNode }> = ({ children }) => {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>(CARD_SELECTOR)
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const amount = card ? card.getBoundingClientRect().width + gap : track.clientWidth
    // Clamp to the real scrollable range — a fixed per-click increment can
    // request a target past the last card (or before the first), leaving
    // blank overscroll space instead of settling on the final card.
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const target = Math.min(Math.max(track.scrollLeft + amount * direction, 0), maxScrollLeft)
    track.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <div className="ak-card-grid__carousel">
      <div
        ref={trackRef}
        className="ak-card-grid__cards"
      >
        {children}
      </div>
      <div className="ak-card-grid__carousel-nav">
        <button
          type="button"
          aria-label="Previous"
          className="ak-card-grid__carousel-btn"
          onClick={() => scrollByCard(-1)}
        >
          <Icon
            name="arrow_back_ios"
            size={16}
          />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="ak-card-grid__carousel-btn"
          onClick={() => scrollByCard(1)}
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

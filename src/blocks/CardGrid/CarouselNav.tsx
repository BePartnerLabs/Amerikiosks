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
    track.scrollBy({ left: amount * direction, behavior: 'smooth' })
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

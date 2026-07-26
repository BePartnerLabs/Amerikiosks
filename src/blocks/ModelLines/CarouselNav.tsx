'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Icon } from '@/components/Icon'

const PANEL_SELECTOR = '.ak-model-lines__panel'

export const ModelLinesCarousel: React.FC<{ children: ReactNode }> = ({ children }) => {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByPanel = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const panel = track.querySelector<HTMLElement>(PANEL_SELECTOR)
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const amount = panel ? panel.getBoundingClientRect().width + gap : track.clientWidth
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const target = Math.min(Math.max(track.scrollLeft + amount * direction, 0), maxScrollLeft)
    track.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <div className="ak-model-lines__carousel">
      <div
        ref={trackRef}
        className="ak-model-lines__lineup"
      >
        {children}
      </div>
      <div className="ak-model-lines__carousel-nav">
        <button
          type="button"
          aria-label="Previous"
          className="ak-model-lines__carousel-btn"
          onClick={() => scrollByPanel(-1)}
        >
          <Icon
            name="arrow_back_ios"
            size={16}
          />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="ak-model-lines__carousel-btn"
          onClick={() => scrollByPanel(1)}
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

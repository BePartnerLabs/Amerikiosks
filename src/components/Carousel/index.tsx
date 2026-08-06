'use client'

import type { ElementType, ReactNode } from 'react'
import { useRef } from 'react'
import { Icon } from '@/components/Icon'

type Props = {
  children: ReactNode
  /**
   * Selector for one panel inside the track. The scroll step is measured from
   * the first match, so a click always advances exactly one panel regardless of
   * how wide it renders at the current breakpoint.
   */
  panelSelector: string
  className: string
  trackClassName: string
  navClassName: string
  buttonClassName: string
  /** The track element. `ol` when the panels are `li`, so the list stays valid. */
  trackAs?: ElementType
  labels?: { previous: string; next: string }
}

/**
 * Horizontal scroll track with previous/next buttons.
 *
 * Extracted from three near-identical copies (CardGrid, ModelLines,
 * ProcessSteps) that differed only in class names and the panel selector. They
 * now wrap this, so a fix to the scroll maths lands everywhere at once instead
 * of in whichever copy someone remembered.
 */
export const Carousel: React.FC<Props> = ({
  children,
  panelSelector,
  className,
  trackClassName,
  navClassName,
  buttonClassName,
  trackAs: Track = 'div',
  labels = { previous: 'Previous', next: 'Next' },
}) => {
  const trackRef = useRef<HTMLElement>(null)

  const scrollByPanel = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const panel = track.querySelector<HTMLElement>(panelSelector)
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const amount = panel ? panel.getBoundingClientRect().width + gap : track.clientWidth
    // Clamp to the real scrollable range — a fixed per-click increment can
    // request a target past the last panel (or before the first), leaving
    // blank overscroll space instead of settling on the final one.
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const target = Math.min(Math.max(track.scrollLeft + amount * direction, 0), maxScrollLeft)
    track.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <Track
        ref={trackRef}
        className={trackClassName}
      >
        {children}
      </Track>
      <div className={navClassName}>
        <button
          type="button"
          aria-label={labels.previous}
          className={buttonClassName}
          onClick={() => scrollByPanel(-1)}
        >
          <Icon
            name="arrow_back_ios"
            size={16}
          />
        </button>
        <button
          type="button"
          aria-label={labels.next}
          className={buttonClassName}
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

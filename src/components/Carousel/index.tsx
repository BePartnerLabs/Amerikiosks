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
  /**
   * Accessible name for the scrollable track. Given one, the track becomes a
   * labelled group; without it, it is still focusable but unnamed.
   */
  trackLabel?: string
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
  trackLabel,
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
      {/*
        A scrollable region has to be reachable by keyboard (WCAG 2.1.1):
        without tabindex nobody navigating by keyboard can pan the track — they
        can only tab through whatever links the panels happen to contain, which
        drags the scroll as a side effect and skips panels that hold none.
      */}
      <Track
        ref={trackRef}
        className={trackClassName}
        tabIndex={0}
        // Only a plain div needs an explicit role. On an `ol`/`ul` the implicit
        // `list` role is the useful one, and overriding it with `group` would
        // stop screen readers announcing the list and its item count — the
        // ProcessSteps test caught exactly that.
        role={trackLabel && Track === 'div' ? 'group' : undefined}
        aria-label={trackLabel}
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

'use client'

import { Pause, Play } from 'lucide-react'
import { useState } from 'react'

/**
 * Visually-hidden-until-focused button that pauses/resumes the marquee
 * animation. Satisfies WCAG 2.2.2 (Pause, Stop, Hide) for keyboard-only
 * users who cannot trigger the existing `:hover` pause.
 *
 * Toggles `.ak-trust-strip__viewport--paused` on the viewport element,
 * which sets `animation-play-state: paused` on both tracks in styles.css.
 */
export const TrustStripPauseToggle: React.FC<{
  viewportRef: React.RefObject<HTMLDivElement | null>
}> = ({ viewportRef }) => {
  const [paused, setPaused] = useState(false)

  const toggle = () => {
    const next = !paused
    setPaused(next)
    viewportRef.current?.classList.toggle('ak-trust-strip__viewport--paused', next)
  }

  return (
    <button
      type="button"
      className="ak-trust-strip__pause-toggle sr-only focus:not-sr-only"
      aria-pressed={paused}
      onClick={toggle}
    >
      {paused ? (
        <>
          <Play
            aria-hidden="true"
            size={16}
          />
          Play logo carousel
        </>
      ) : (
        <>
          <Pause
            aria-hidden="true"
            size={16}
          />
          Pause logo carousel
        </>
      )}
    </button>
  )
}

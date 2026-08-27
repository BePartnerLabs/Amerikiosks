'use client'

import { Children, type ReactNode, useCallback, useEffect, useRef } from 'react'

type Props = { children: ReactNode; label: string }

/**
 * Wrap-around for a native scroll-snap track.
 *
 * The list is rendered twice and the scroll position is teleported by one
 * set-width whenever it crosses either copy's boundary. Instant, so the jump
 * lands between two identical frames and there is nothing to see — no clone
 * bookkeeping, no transform, and the track keeps being a plain scroll
 * container, which is what makes trackpads, touch and keyboard all work
 * without a single event handler of ours.
 *
 * The second copy is `inert`, not merely `aria-hidden`: hiding it from the
 * accessibility tree while leaving its links focusable would be worse than not
 * hiding it — tab would stop on a card no screen reader can announce. `inert`
 * takes it out of both at once, so each family is reachable exactly once and
 * the duplication stays a purely visual device.
 */
export const InfiniteTrack: React.FC<Props> = ({ children, label }) => {
  const ref = useRef<HTMLUListElement>(null)
  const items = Children.toArray(children)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    const half = el.scrollWidth / 2
    if (half <= 0) return
    // A threshold rather than an exact edge: momentum scrolling overshoots, and
    // comparing against 0 would fire on every rubber-band at the start.
    if (el.scrollLeft >= half) el.scrollLeft -= half
    else if (el.scrollLeft < 1) el.scrollLeft += half
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Start inside the first copy so there is material on both sides from the
    // first frame; without this the track cannot be dragged to the left until
    // the visitor has scrolled right at least once.
    el.scrollLeft = 1
  }, [])

  return (
    <ul
      ref={ref}
      className="ak-family-carousel__track"
      onScroll={onScroll}
      aria-label={label}
    >
      {items}
      {/* `display: contents` on both, so the clones become direct grid items
          of the track instead of one column holding a nested list. */}
      <li
        className="ak-family-carousel__clones"
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: `inert` is the point — see the docstring
        inert
      >
        <ul className="ak-family-carousel__clone-list">{items}</ul>
      </li>
    </ul>
  )
}

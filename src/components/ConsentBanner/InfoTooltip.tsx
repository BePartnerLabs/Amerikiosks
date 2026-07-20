'use client'

import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'

type Props = {
  id: string
  label: string
  description: string
}

const PLACEMENT_CLASSES = ['bp-tooltip--start', 'bp-tooltip--end', 'bp-tooltip--below']
const EDGE_MARGIN = 8

export function InfoTooltip({ id, label, description }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  function place() {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    tooltip.classList.remove(...PLACEMENT_CLASSES)

    let rect = tooltip.getBoundingClientRect()
    if (rect.left < EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--start')
    } else if (rect.right > window.innerWidth - EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--end')
    }

    rect = tooltip.getBoundingClientRect()
    if (rect.top < EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--below')
    }
  }

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    function handlePointerDown(e: PointerEvent) {
      if (!wrap?.contains(e.target as Node)) {
        const trigger = wrap?.querySelector<HTMLButtonElement>('.bp-tooltip-trigger')
        if (trigger && document.activeElement === trigger) trigger.blur()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') e.currentTarget.blur()
  }

  return (
    <span
      className="bp-tooltip-wrap"
      ref={wrapRef}
    >
      <button
        type="button"
        className="bp-tooltip-trigger"
        aria-label={label}
        aria-describedby={id}
        onMouseEnter={place}
        onFocus={place}
        onKeyDown={handleKeyDown}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <line
            x1="12"
            y1="11"
            x2="12"
            y2="16"
          />
          <circle
            cx="12"
            cy="8"
            r="0.5"
            fill="currentColor"
          />
        </svg>
      </button>
      <span
        className="bp-tooltip"
        role="tooltip"
        id={id}
        ref={tooltipRef}
      >
        {description}
      </span>
    </span>
  )
}

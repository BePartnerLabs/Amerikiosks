'use client'

import Image from 'next/image'
import { type PointerEvent, useRef, useState } from 'react'
import { useActiveFamily } from './Provider'
import type { FamilyView } from './types'

// The lineup draws every line at the same scale, so the sizes compare
// honestly — a 39" Zeta really is half a 78" Alpha. Anything without
// dimensions loaded falls back to the reference height.
const PX_PER_INCH = 3.1
const FALLBACK_HEIGHT_IN = 77
const MIN_WIDTH_PX = 84

const sizeOf = (family: FamilyView) => {
  const heightIn = family.heightIn ?? FALLBACK_HEIGHT_IN
  const widthIn = family.widthIn ?? heightIn * 0.9
  return {
    height: Math.round(heightIn * PX_PER_INCH),
    width: Math.max(MIN_WIDTH_PX, Math.round(widthIn * PX_PER_INCH)),
  }
}

export const MachinesLineup: React.FC = () => {
  const { families, active, select } = useActiveFamily()
  const [hovered, setHovered] = useState<string | null>(null)
  const tilts = useRef<Record<string, HTMLSpanElement | null>>({})

  const onMove = (slug: string) => (event: PointerEvent<HTMLButtonElement>) => {
    const shape = tilts.current[slug]
    if (!shape) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offset = (event.clientX - rect.left) / rect.width - 0.5
    shape.style.setProperty('--ak-lineup-tilt', `${(offset * 15).toFixed(1)}deg`)
  }

  const resetTilt = (slug: string) => () => {
    tilts.current[slug]?.style.setProperty('--ak-lineup-tilt', '0deg')
  }

  return (
    <div
      className="ak-lineup"
      data-hot={hovered ? 'true' : 'false'}
      onPointerLeave={() => setHovered(null)}
    >
      {families.map((family) => {
        const { width, height } = sizeOf(family)
        const isHot = hovered === family.slug

        return (
          <button
            key={family.id}
            type="button"
            className={`ak-lineup__item${isHot ? ' ak-lineup__item--hot' : ''}`}
            style={{ width: `${width}px` }}
            aria-pressed={active.slug === family.slug}
            onPointerEnter={() => setHovered(family.slug)}
            onPointerMove={onMove(family.slug)}
            onPointerLeave={resetTilt(family.slug)}
            onFocus={() => setHovered(family.slug)}
            onBlur={() => setHovered(null)}
            onClick={() => select(family.slug)}
            data-ga-event="machine_family_click"
            data-ga-label={family.name}
          >
            <span
              className="ak-lineup__unit"
              style={{ height: `${height}px` }}
              ref={(node) => {
                tilts.current[family.slug] = node
              }}
            >
              {family.thumbUrl && (
                <Image
                  src={family.thumbUrl}
                  alt={family.name}
                  fill
                  sizes="240px"
                  quality={100}
                  className="ak-lineup__img ak-lineup__img--front"
                />
              )}
              {family.hoverUrl && (
                <Image
                  src={family.hoverUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="240px"
                  quality={100}
                  className="ak-lineup__img ak-lineup__img--side"
                />
              )}
              <span className="ak-lineup__floor" />
            </span>
            <span className="ak-lineup__name">{family.name}</span>
            <span className="ak-lineup__dot" />
          </button>
        )
      })}
    </div>
  )
}

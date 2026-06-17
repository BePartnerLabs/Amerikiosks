'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Machine } from '@/payload-types'
import { MachineTile } from './MachineTile'

type Props = {
  machines: Machine[]
  allTags: string[]
}

const formatTagLabel = (tag: string) =>
  tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const MachinesClient: React.FC<Props> = ({ machines, allTags }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') ?? '')
  const trackRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (activeTag) {
      params.set('tag', activeTag)
    } else {
      params.delete('tag')
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
  }, [activeTag, router])

  useLayoutEffect(() => {
    const chip = chipRefs.current.get(activeTag)
    const track = trackRef.current
    if (!chip || !track) return
    const trackRect = track.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    setIndicatorStyle({
      width: chipRect.width,
      height: chipRect.height,
      transform: `translateX(${chipRect.left - trackRect.left + track.scrollLeft}px)`,
    })
  }, [activeTag])

  const filtered = activeTag
    ? machines.filter((m) => m.tags?.some((t) => t.label === activeTag))
    : machines

  const setTag = (tag: string) => {
    const apply = () => setActiveTag(tag)
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply)
    } else {
      apply()
    }
  }

  return (
    <>
      <fieldset className="ak-machines-page__filters">
        <legend className="sr-only">Filter by tag</legend>
        <div
          className="ak-machines-page__filters-track"
          ref={trackRef}
        >
          <span
            className="ak-machines-page__filter-indicator"
            style={indicatorStyle}
            aria-hidden="true"
          />
          <button
            type="button"
            ref={(el) => {
              if (el) chipRefs.current.set('', el)
              else chipRefs.current.delete('')
            }}
            className="ak-machines-page__filter-chip"
            aria-pressed={activeTag === ''}
            onClick={() => setTag('')}
            data-ga-block="machines_page"
            data-ga-event="machines_filter"
            data-ga-label="all"
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              ref={(el) => {
                if (el) chipRefs.current.set(tag, el)
                else chipRefs.current.delete(tag)
              }}
              className="ak-machines-page__filter-chip"
              aria-pressed={activeTag === tag}
              onClick={() => setTag(tag)}
              data-ga-block="machines_page"
              data-ga-event="machines_filter"
              data-ga-label={tag}
            >
              {formatTagLabel(tag)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="ak-machines-page__grid">
        {filtered.map((machine, index) => (
          <MachineTile
            key={machine.id}
            machine={machine}
            index={index}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="ak-machines-page__empty">No machines found for this tag.</p>
      )}
    </>
  )
}

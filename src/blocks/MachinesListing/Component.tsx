'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Machine } from '@/payload-types'
import { MachineCard } from './MachineCard'

type Props = {
  machines: Machine[]
  allTags: string[]
  itemsPerPage: number
}

const formatTagLabel = (tag: string) =>
  tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const MachinesListingClient: React.FC<Props> = ({ machines, allTags, itemsPerPage }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1)
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
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
  }, [activeTag, page, router])

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
    ? machines.filter((m) => m.tags?.some((t) => typeof t === 'object' && t.label === activeTag))
    : machines

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const setTag = (tag: string) => {
    setActiveTag(tag)
    setPage(1)
  }

  return (
    <>
      <fieldset className="ak-machines-listing__filters">
        <legend className="sr-only">Filter by tag</legend>
        <div
          className="ak-machines-listing__filters-track"
          ref={trackRef}
        >
          <span
            className="ak-machines-listing__filter-indicator"
            style={indicatorStyle}
            aria-hidden="true"
          />
          <button
            type="button"
            ref={(el) => {
              if (el) chipRefs.current.set('', el)
              else chipRefs.current.delete('')
            }}
            className="ak-machines-listing__filter-chip"
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
              className="ak-machines-listing__filter-chip"
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

      <div className="ak-machines-listing__grid">
        {paged.map((machine, index) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            index={index}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="ak-machines-listing__empty">No machines found for this tag.</p>
      )}

      {totalPages > 1 && (
        <nav
          className="ak-machines-listing__pagination"
          aria-label="Machines pagination"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              type="button"
              key={p}
              className="bp-btn ak-machines-listing__page-btn"
              aria-current={p === currentPage ? 'page' : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </>
  )
}

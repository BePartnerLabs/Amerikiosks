'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import type { Machine } from '@/payload-types'
import { MachineTile } from './MachineTile'

type Props = {
  machines: Machine[]
  allTags: string[]
}

export const MachinesClient: React.FC<Props> = ({ machines, allTags }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? ''

  const filtered = activeTag
    ? machines.filter((m) => m.tags?.some((t) => t.label === activeTag))
    : machines

  const setTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <fieldset className="ak-machines-page__filters">
        <legend className="sr-only">Filter by tag</legend>
        <button
          type="button"
          className="bp-btn ak-machines-page__filter-btn"
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
            className="bp-btn ak-machines-page__filter-btn"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
            data-ga-block="machines_page"
            data-ga-event="machines_filter"
            data-ga-label={tag}
          >
            {tag}
          </button>
        ))}
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

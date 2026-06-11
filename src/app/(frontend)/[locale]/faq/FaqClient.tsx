'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import RichText from '@/components/RichText'
import type { FaqItem } from '@/payload-types'

type Props = {
  faqs: FaqItem[]
  allTags: string[]
}

export const FaqClient: React.FC<Props> = ({ faqs, allTags }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? ''

  const filtered = activeTag ? faqs.filter((f) => f.tags?.some((t) => t.label === activeTag)) : faqs

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
      <fieldset className="ak-faq-page__filters">
        <legend className="sr-only">Filter by topic</legend>
        <button
          type="button"
          className="bp-btn ak-faq-page__filter-btn"
          aria-pressed={activeTag === ''}
          onClick={() => setTag('')}
          data-ga-block="faq_page"
          data-ga-event="faq_filter"
          data-ga-label="all"
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            type="button"
            key={tag}
            className="bp-btn ak-faq-page__filter-btn"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
            data-ga-block="faq_page"
            data-ga-event="faq_filter"
            data-ga-label={tag}
          >
            {tag}
          </button>
        ))}
      </fieldset>

      <div className="bp-accordion ak-faq-page__accordion">
        {filtered.map((item) => (
          <details
            key={item.id}
            className="bp-accordion__item"
            name="faq-page"
          >
            <summary
              className="bp-accordion__summary"
              data-ga-event="faq_expand"
              data-ga-label={item.question}
            >
              {item.question}
            </summary>
            <div className="bp-accordion__body">
              {item.answer && (
                <RichText data={item.answer as Parameters<typeof RichText>[0]['data']} />
              )}
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <p className="ak-faq-page__empty">No questions found for this topic.</p>
        )}
      </div>
    </>
  )
}

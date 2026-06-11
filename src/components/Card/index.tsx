'use client'
import Link from 'next/link'
import type React from 'react'
import { Media } from '@/components/Media'
import type { Insight } from '@/payload-types'
import useClickableCard from '@/utilities/useClickableCard'
import './styles.css'

export type CardPostData = Pick<Insight, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  className?: string
  doc?: CardPostData
  featured?: boolean
  relationTo?: 'insights'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { doc, featured = false, relationTo, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}
  const titleToUse = titleFromProps || title
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={`ak-post-card${featured ? ' ak-post-card--featured' : ''}`}
      ref={card.ref}
    >
      <div className="ak-post-card__media">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media
            resource={metaImage}
            fill={featured}
            size={featured ? '(max-width: 640px) 100vw, 60vw' : '33vw'}
            imgClassName="ak-post-card__img"
          />
        ) : (
          <div
            className="ak-post-card__placeholder"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="ak-post-card__body">
        {titleToUse && (
          <h3 className="ak-post-card__title">
            <Link
              href={href}
              ref={link.ref}
              className="ak-post-card__title-link"
              data-ga-event="insight_card_click"
              data-ga-label={titleToUse}
            >
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="ak-post-card__description">{description.replace(/\s/g, ' ')}</p>
        )}
        <Link
          href={href}
          className="ak-post-card__cta"
          aria-hidden="true"
          tabIndex={-1}
        >
          Know more ›
        </Link>
      </div>
    </article>
  )
}

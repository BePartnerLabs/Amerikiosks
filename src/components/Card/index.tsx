'use client'
import Link from 'next/link'
import type React from 'react'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import type { Insight, Media as MediaType } from '@/payload-types'
import useClickableCard from '@/utilities/useClickableCard'
import './styles.css'

export type CardPostData = Pick<Insight, 'slug' | 'categories' | 'meta' | 'title'>

type CardVariant = 'post' | 'compact' | 'icon' | 'pillar'

type CardLink = {
  href: string
  label?: string | null
}

export type CardProps = {
  className?: string
  variant?: CardVariant
  // 'post' variant — driven by an Insight doc
  doc?: CardPostData
  relationTo?: 'insights'
  featured?: boolean
  showCategories?: boolean
  // 'compact' | 'icon' | 'pillar' variants — manually authored
  media?: MediaType | number | null
  icon?: string | null
  eyebrow?: string | null
  title?: string | null
  body?: React.ReactNode
  link?: CardLink | null
}

const PostCard: React.FC<CardProps> = (props) => {
  const { card, link: linkRef } = useClickableCard({})
  const { className = '', doc, relationTo, featured = false, title: titleProp } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}
  const titleToUse = titleProp || title
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={`ak-post-card${featured ? ' ak-post-card--featured' : ''}${className ? ` ${className}` : ''}`}
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
              ref={linkRef.ref}
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

const ManualCard: React.FC<CardProps> = (props) => {
  const { className = '', variant, media, icon, eyebrow, title: titleProp, body, link } = props

  const isLinked = Boolean(link?.href) && variant === 'icon'

  return (
    <div
      className={`ak-card-grid__card${isLinked ? ' ak-card-grid__card--linked' : ''}${className ? ` ${className}` : ''}`}
      itemScope
      itemProp="itemListElement"
      itemType="https://schema.org/ListItem"
    >
      {media && typeof media === 'object' && (
        <div className="ak-card-grid__card-media">
          <Media
            resource={media}
            fill
            size="(max-width: 40rem) 100vw, 25vw"
            imgClassName="ak-card-grid__card-img"
          />
        </div>
      )}
      {icon && variant === 'icon' && (
        <span
          className="ak-card-grid__card-icon-wrap"
          aria-hidden="true"
        >
          <Icon
            name={icon}
            className="ak-card-grid__card-icon"
            size={40}
          />
        </span>
      )}
      {eyebrow && variant === 'pillar' && <p className="ak-card-grid__card-eyebrow">{eyebrow}</p>}
      {titleProp && (
        <p
          className="ak-card-grid__card-title"
          itemProp="name"
        >
          {titleProp}
        </p>
      )}
      {body && <div className="ak-card-grid__card-body">{body}</div>}
      {link?.href && link.label && variant === 'icon' && (
        <Link
          href={link.href}
          className="ak-card-grid__card-link"
          data-ga-event="card_cta_click"
          data-ga-label={titleProp ?? undefined}
        >
          {link.label}
          <Icon
            name="arrow_forward_ios"
            className="ak-card-grid__card-link-arrow"
            size={16}
          />
        </Link>
      )}
    </div>
  )
}

export const Card: React.FC<CardProps> = (props) => {
  const { variant = 'post' } = props

  if (variant === 'post') {
    return <PostCard {...props} />
  }

  return <ManualCard {...props} />
}

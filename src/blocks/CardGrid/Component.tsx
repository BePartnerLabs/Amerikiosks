import Link from 'next/link'
import type React from 'react'
import RichText from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import type { CardGridBlock as CardGridBlockProps, Page } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type Item = NonNullable<CardGridBlockProps['items']>[number]

function resolveUrl(link: Item['link'] | CardGridBlockProps['link']): string | null {
  if (!link) return null
  if (link.type === 'reference' && link.reference && typeof link.reference === 'object') {
    return `/${(link.reference as Page).slug}`
  }
  return link.url ?? null
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({
  variant,
  eyebrow,
  heading,
  subheading,
  link,
  items,
  blockName,
  blockType,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  const ctaUrl = resolveUrl(link)

  return (
    <section
      className={`ak-card-grid ak-card-grid--${variant}`}
      aria-label={heading}
      itemScope
      itemType="https://schema.org/ItemList"
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: heading,
            numberOfItems: items?.length ?? 0,
          }),
        }}
      />

      <div className="bp-content-grid">
        <div className="breakout ak-card-grid__inner">
          {heading && (
            <div className="ak-card-grid__header">
              <SectionHeader
                eyebrow={eyebrow}
                heading={heading}
                subtitle={variant === 'pillar' ? subheading : undefined}
                align={variant === 'compact' ? 'left' : 'center'}
              />
            </div>
          )}

          {Array.isArray(items) && items.length > 0 && (
            <div className="ak-card-grid__cards">
              {items.map((item, i) => {
                const cardUrl = resolveUrl(item.link)
                return (
                  <div
                    key={item.id ?? i}
                    className={`ak-card-grid__card${cardUrl && variant === 'icon' ? ' ak-card-grid__card--linked' : ''}`}
                    itemScope
                    itemProp="itemListElement"
                    itemType="https://schema.org/ListItem"
                  >
                    {item.icon && variant === 'icon' && (
                      <span
                        className="ak-card-grid__card-icon-wrap"
                        aria-hidden="true"
                      >
                        <span className="ak-card-grid__card-icon material-symbols-outlined">
                          {item.icon}
                        </span>
                      </span>
                    )}
                    {item.eyebrow && variant === 'pillar' && (
                      <p className="ak-card-grid__card-eyebrow">{item.eyebrow}</p>
                    )}
                    {item.title && (
                      <p
                        className="ak-card-grid__card-title"
                        itemProp="name"
                      >
                        {item.title}
                      </p>
                    )}
                    {item.body && (
                      <div className="ak-card-grid__card-body">
                        <RichText
                          data={item.body}
                          enableGutter={false}
                        />
                      </div>
                    )}
                    {cardUrl && item.link?.label && variant === 'icon' && (
                      <Link
                        href={cardUrl}
                        className="ak-card-grid__card-link"
                        data-ga-event="card_cta_click"
                        data-ga-label={item.title}
                      >
                        {item.link.label}
                        <span
                          className="ak-card-grid__card-link-arrow"
                          aria-hidden="true"
                        >
                          {' '}
                          &rsaquo;
                        </span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {ctaUrl && link?.label && variant === 'pillar' && (
            <div className="ak-card-grid__cta">
              <Link
                href={ctaUrl}
                className="ak-card-grid__cta-btn"
                data-ga-event="card_grid_cta_click"
              >
                {link.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

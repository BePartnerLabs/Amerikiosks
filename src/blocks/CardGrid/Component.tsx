import Link from 'next/link'
import type React from 'react'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import RichText from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import type { CardGridBlock as CardGridBlockProps, Page } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { CardGridCarousel } from './CarouselNav'
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

  const cards =
    Array.isArray(items) && items.length > 0
      ? items.map((item, i) => {
          const cardUrl = resolveUrl(item.link)
          return (
            <Card
              key={item.id ?? i}
              variant={variant}
              media={item.media}
              icon={item.icon}
              eyebrow={item.eyebrow}
              title={item.title}
              body={
                item.body && (
                  <RichText
                    data={item.body}
                    enableGutter={false}
                  />
                )
              }
              link={cardUrl ? { href: cardUrl, label: item.link?.label } : null}
            />
          )
        })
      : null

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

          {cards &&
            (variant === 'compact' || variant === 'icon' ? (
              <CardGridCarousel>{cards}</CardGridCarousel>
            ) : (
              <div className="ak-card-grid__cards">{cards}</div>
            ))}

          {ctaUrl && link?.label && variant === 'pillar' && (
            <div className="ak-card-grid__cta">
              <Link
                href={ctaUrl}
                className="ak-card-grid__cta-btn"
                data-ga-event="card_grid_cta_click"
              >
                {link.label}
                <Icon
                  name="arrow_forward_ios"
                  className="ak-card-grid__cta-btn-arrow"
                  size={16}
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

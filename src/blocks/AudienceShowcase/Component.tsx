import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type {
  AudienceShowcaseBlock as AudienceShowcaseBlockProps,
  Media,
  Page,
} from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type PopulatedItem = NonNullable<AudienceShowcaseBlockProps['items']>[number] & {
  page: Page
  image: Media
}

export const AudienceShowcaseBlock: React.FC<AudienceShowcaseBlockProps> = ({
  eyebrow,
  heading,
  subheading,
  items,
  blockName,
  blockType,
}) => {
  if (!heading) return null

  const populatedItems = (items ?? []).filter(
    (item): item is PopulatedItem =>
      item.page !== null &&
      typeof item.page === 'object' &&
      item.image !== null &&
      typeof item.image === 'object',
  )

  return (
    <section
      className="ak-audience-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-audience-showcase__inner">
          <div className="ak-audience-showcase__header">
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              subtitle={subheading}
              align="center"
            />
          </div>

          {populatedItems.length > 0 && (
            <div className="ak-audience-showcase__grid">
              {populatedItems.map((item) => {
                const title = item.label ?? item.page.title
                const description = item.description ?? item.page.meta?.description
                const href = `/${item.page.slug}`

                return (
                  <Link
                    key={item.id ?? item.page.id}
                    href={href}
                    className="ak-audience-showcase__card"
                    data-ga-event="audience_card_click"
                    data-ga-label={item.page.title}
                  >
                    <Image
                      src={item.image.url ?? ''}
                      alt={item.image.alt ?? title}
                      fill
                      className="ak-audience-showcase__card-img"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div
                      className="ak-audience-showcase__card-overlay"
                      aria-hidden="true"
                    />
                    <div className="ak-audience-showcase__card-content">
                      <p className="ak-audience-showcase__card-title">{title}</p>
                      {description && (
                        <p className="ak-audience-showcase__card-description">{description}</p>
                      )}
                      {item.cta && (
                        <span className="ak-audience-showcase__card-cta">{item.cta}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

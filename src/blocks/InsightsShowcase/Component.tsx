import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { InsightsShowcaseBlock as InsightsShowcaseBlockProps, Media } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

export const InsightsShowcaseBlock: React.FC<InsightsShowcaseBlockProps> = async ({
  eyebrow,
  heading,
  blockName,
  blockType,
}) => {
  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'en' | 'es'

  const { docs } = await payload.find({
    collection: 'insights',
    where: { featured: { equals: true }, _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 4,
    depth: 1,
    overrideAccess: false,
    locale,
    fallbackLocale: 'en',
    select: {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
    },
  })

  if (!heading || docs.length === 0) return null

  const [featured, ...cards] = docs

  const heroImg =
    featured.heroImage && typeof featured.heroImage === 'object'
      ? (featured.heroImage as Media)
      : null
  const heroExcerpt = featured.meta?.description ?? null
  const heroHref = `/${locale}/insights/${featured.slug}`

  return (
    <section
      className="ak-insights-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-insights-showcase__inner">
          <div className="ak-insights-showcase__header">
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              align="center"
            />
          </div>

          <div className="ak-insights-showcase__featured">
            {heroImg?.url && (
              <div className="ak-insights-showcase__featured-img-wrap">
                <Image
                  src={heroImg.url}
                  alt={heroImg.alt ?? featured.title}
                  fill
                  className="ak-insights-showcase__featured-img"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  priority
                />
              </div>
            )}
            <div className="ak-insights-showcase__featured-body">
              <h2 className="ak-insights-showcase__featured-title">{featured.title}</h2>
              {heroExcerpt && (
                <p className="ak-insights-showcase__featured-excerpt">{heroExcerpt}</p>
              )}
              <Link
                href={heroHref}
                className="ak-insights-showcase__link"
                data-ga-event="insights_featured_click"
                data-ga-label={featured.title}
              >
                Know more
                <span
                  className="ak-insights-showcase__link-arrow material-symbols-outlined"
                  aria-hidden="true"
                >
                  arrow_forward_ios
                </span>
              </Link>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="ak-insights-showcase__cards">
              {cards.map((insight) => {
                const img =
                  insight.heroImage && typeof insight.heroImage === 'object'
                    ? (insight.heroImage as Media)
                    : null
                const excerpt = insight.meta?.description ?? null
                const href = `/${locale}/insights/${insight.slug}`

                return (
                  <div
                    key={insight.id}
                    className="bp-card"
                  >
                    {img?.url && (
                      <div className="bp-card__image">
                        <Image
                          src={img.url}
                          alt={img.alt ?? insight.title}
                          fill
                          className=""
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="bp-card__body">
                      <p className="ak-insights-showcase__card-title">{insight.title}</p>
                      {excerpt && <p className="ak-insights-showcase__card-excerpt">{excerpt}</p>}
                      <Link
                        href={href}
                        className="ak-insights-showcase__link"
                        data-ga-event="insights_card_click"
                        data-ga-label={insight.title}
                      >
                        Know more
                        <span
                          className="ak-insights-showcase__link-arrow material-symbols-outlined"
                          aria-hidden="true"
                        >
                          arrow_forward_ios
                        </span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

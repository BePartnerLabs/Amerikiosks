import type React from 'react'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './low-impact.css'

type LowImpactHeroType = Omit<Page['hero'], 'richText'> & {
  richText?: Page['hero']['richText']
  breadcrumbs?: Page['breadcrumbs']
}

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ richText, breadcrumbs, tags }) => {
  const crumbs = breadcrumbs ?? []

  const breadcrumbJsonLd =
    crumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: crumb.label ?? '',
            item: crumb.url ?? undefined,
          })),
        }
      : null

  const breadcrumbLabel = crumbs.map((c) => c.label ?? '').join(' / ')

  return (
    <section
      className="ak-hero-page"
      aria-label="Page hero"
    >
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <div className="bp-content-grid">
        <div className="breakout ak-hero-page__inner">
          {breadcrumbLabel && <p className="ak-hero-page__breadcrumb">{breadcrumbLabel}</p>}

          {richText && (
            <div className="ak-hero-page__heading-row">
              <div
                className="ak-hero-page__accent"
                aria-hidden="true"
              />
              <RichText
                data={richText}
                enableGutter={false}
              />
            </div>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <ul className="ak-hero-page__tags">
              {tags.map(({ label, id }, i) => (
                <li key={id ?? i}>
                  <span className="ak-hero-page__tag">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

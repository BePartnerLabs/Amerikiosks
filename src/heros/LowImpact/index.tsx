import type React from 'react'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './low-impact.css'

type LowImpactHeroType = Omit<Page['hero'], 'richText'> & {
  richText?: Page['hero']['richText']
}

function buildBreadcrumbJsonLd(breadcrumb: string) {
  const parts = breadcrumb.split(' / ').map((label) => label.trim())
  const itemListElement = parts.map((name, index) => {
    const isLast = index === parts.length - 1
    const slug = name === 'Home' ? '/' : `/${name.toLowerCase().replace(/\s+/g, '-')}`
    return {
      '@type': 'ListItem',
      position: index + 1,
      name,
      ...(isLast ? {} : { item: slug }),
    }
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ richText, breadcrumb, tags }) => {
  return (
    <section
      className="ak-hero-page"
      aria-label="Page hero"
    >
      {breadcrumb && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is a common use case for dangerouslySetInnerHTML, and the content is generated from a trusted source (the breadcrumb string)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumb)) }}
        />
      )}
      <div className="bp-content-grid">
        <div className="breakout ak-hero-page__inner">
          {breadcrumb && <p className="ak-hero-page__breadcrumb">{breadcrumb}</p>}

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

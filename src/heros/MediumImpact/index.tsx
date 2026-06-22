import type React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './medium-impact.css'

type Props = Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }

export const MediumImpactHero: React.FC<Props> = ({
  links,
  media,
  richText,
  tags,
  breadcrumbs,
}) => {
  // Prepend synthetic Home root — the plugin only tracks parent chain, not the root page
  const home = { label: 'Home', url: '/', id: 'home' }
  const crumbs = breadcrumbs && breadcrumbs.length > 0 ? [home, ...breadcrumbs] : []

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
    <section className="ak-hero-interior">
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <div className="bp-content-grid">
        <div className="breakout ak-hero-interior__inner">
          {/* Text column */}
          <div className="ak-hero-interior__text">
            {breadcrumbLabel && <p className="ak-hero-interior__breadcrumb">{breadcrumbLabel}</p>}

            {richText && (
              <RichText
                data={richText}
                enableGutter={false}
              />
            )}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="ak-hero-interior__actions">
                {links.map(({ link }, i) => (
                  <li key={link.url ?? link.label ?? i}>
                    <CMSLink
                      {...link}
                      className={
                        link.appearance === 'outline' ? 'bp-btn--outline-solid' : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            )}

            {Array.isArray(tags) && tags.length > 0 && (
              <ul className="ak-hero-interior__tags">
                {tags.map(({ label, id }, i) => (
                  <li key={id ?? i}>
                    <span className="ak-hero-interior__tag">{label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Media column */}
          {media && typeof media === 'object' && (
            <div className="ak-hero-interior__media">
              <Media
                priority
                resource={media}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

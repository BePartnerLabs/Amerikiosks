import type React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './medium-impact.css'

export const MediumImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  richText,
  breadcrumb,
  tags,
}) => {
  return (
    <section className="ak-hero-interior">
      <div className="bp-content-grid">
        <div className="breakout ak-hero-interior__inner">
          {/* Text column */}
          <div className="ak-hero-interior__text">
            {breadcrumb && <p className="ak-hero-interior__breadcrumb">{breadcrumb}</p>}

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
                    <CMSLink {...link} />
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

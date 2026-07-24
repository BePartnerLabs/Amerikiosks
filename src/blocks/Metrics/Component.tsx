import Link from 'next/link'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { MetricsBlock as MetricsBlockProps, Page } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { MetricsCounter } from './MetricsCounter'
import './styles.css'

function resolveUrl(link: MetricsBlockProps['link']): string | null {
  if (!link) return null
  if (link.type === 'reference' && link.reference && typeof link.reference === 'object') {
    return `/${(link.reference as Page).slug}`
  }
  return link.url ?? null
}

export const MetricsBlock: React.FC<MetricsBlockProps> = ({
  eyebrow,
  heading,
  items,
  link,
  blockType,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  const ctaUrl = resolveUrl(link)

  return (
    <section
      className="ak-metrics"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-metrics__inner">
          {heading && (
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              align="center"
            />
          )}

          {items && items.length > 0 && (
            <div className="ak-metrics__stats">
              {items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="ak-metrics__stat"
                >
                  <span className="ak-metrics__stat-value">
                    <MetricsCounter value={item.value} />
                  </span>
                  <p className="ak-metrics__stat-label">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {ctaUrl && link?.label && (
            <div className="ak-metrics__cta">
              <Link
                href={ctaUrl}
                className="ak-metrics__cta-btn"
                data-ga-event="metrics_cta_click"
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

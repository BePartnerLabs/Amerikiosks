import type React from 'react'
import { CMSLink } from '@/components/Link'
import { SectionHeader } from '@/components/SectionHeader'
import type { MetricsBlock as MetricsBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { MetricsCounter } from './MetricsCounter'
import './styles.css'

export const MetricsBlock: React.FC<MetricsBlockProps> = ({
  eyebrow,
  heading,
  items,
  links,
  blockType,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  const cta = links?.[0]?.link

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

          {cta?.label && (
            <div className="ak-metrics__cta">
              <CMSLink
                {...cta}
                appearance="default"
                data-ga-event="metrics_cta_click"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

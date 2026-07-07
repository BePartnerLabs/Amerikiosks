import { Icon } from '@/components/Icon'
import type { Machine } from '@/payload-types'

type Props = {
  highlights: NonNullable<Machine['highlights']>
}

export const Highlights: React.FC<Props> = ({ highlights }) => {
  const items = highlights.items ?? []
  if (items.length === 0) return null

  return (
    <section className="ak-machine-detail__highlights">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__highlights-inner">
          {highlights.eyebrow && (
            <p className="ak-machine-detail__highlights-eyebrow">{highlights.eyebrow}</p>
          )}
          {highlights.heading && (
            <h2 className="ak-machine-detail__highlights-heading">{highlights.heading}</h2>
          )}
          <div className="ak-machine-detail__highlights-strip">
            {items.map((item, i) => (
              <div
                key={item.id ?? i}
                className="ak-machine-detail__highlight-card"
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    className="ak-machine-detail__highlight-icon"
                  />
                )}
                <p className="ak-machine-detail__highlight-title">{item.title}</p>
                {item.description && (
                  <p className="ak-machine-detail__highlight-description">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'
import '@/blocks/InsightsShowcase/styles.css'
import { SectionHeader } from '@/components/SectionHeader'
import type { MachineFamily, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'

type Props = {
  highlights: NonNullable<MachineFamily['highlights']>
}

// Renders each highlight as a horizontal "featured" card — the same
// ak-insights-showcase__featured layout used for the featured insight —
// when the item has an image. Falls back to the compact icon-card strip
// when it doesn't.
export const FamilyHighlights: React.FC<Props> = ({ highlights }) => {
  const items = highlights.items ?? []
  if (items.length === 0) return null

  const hasImages = items.some((item) => Boolean(item.image))

  return (
    <section className="ak-family-detail__highlights">
      <div className="bp-content-grid">
        <div className="content ak-family-detail__highlights-head">
          <SectionHeader
            eyebrow={highlights.eyebrow ?? undefined}
            heading={highlights.heading ?? ''}
            align="center"
          />
        </div>
      </div>

      {hasImages ? (
        <div className="bp-content-grid">
          <div className="content ak-family-detail__highlight-cards">
            {items.map((item, i) => {
              const image = typeof item.image === 'object' ? (item.image as Media) : null
              const reversed = i % 2 === 1

              return (
                <div
                  key={item.id ?? i}
                  className={`ak-insights-showcase__featured${reversed ? ' ak-family-detail__highlight-card--reverse' : ''}`}
                >
                  {image?.url && (
                    <div className="ak-insights-showcase__featured-img-wrap">
                      <Image
                        src={getBestMediaUrl(image, 900) ?? image.url}
                        alt=""
                        fill
                        className="ak-insights-showcase__featured-img"
                        sizes="(max-width: 768px) 100vw, 55vw"
                      />
                    </div>
                  )}
                  <div className="ak-insights-showcase__featured-body">
                    <h3 className="ak-insights-showcase__featured-title">{item.title}</h3>
                    {item.description && (
                      <p className="ak-insights-showcase__featured-excerpt">{item.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bp-content-grid">
          <div className="content ak-machine-detail__highlights-strip">
            {items.map((item, i) => (
              <div
                key={item.id ?? i}
                className="ak-machine-detail__highlight-card"
              >
                <p className="ak-machine-detail__highlight-title">{item.title}</p>
                {item.description && (
                  <p className="ak-machine-detail__highlight-description">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

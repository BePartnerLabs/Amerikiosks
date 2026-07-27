import Image from 'next/image'
import { SectionHeader } from '@/components/SectionHeader'
import type { MachineFamily, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'

type Props = {
  highlights: NonNullable<MachineFamily['highlights']>
}

export const FamilyHighlights: React.FC<Props> = ({ highlights }) => {
  const items = highlights.items ?? []
  if (items.length === 0) return null

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

      <div className="bp-content-grid">
        <div className="content ak-family-detail__highlight-grid">
          {items.map((item, i) => {
            const image = typeof item.image === 'object' ? (item.image as Media) : null

            return (
              <div
                key={item.id ?? i}
                className="ak-family-detail__highlight-card"
              >
                <p className="ak-family-detail__highlight-card-title">{item.title}</p>
                <div className="ak-family-detail__highlight-card-img-wrap">
                  {image?.url && (
                    <Image
                      src={getBestMediaUrl(image, 500) ?? image.url}
                      alt=""
                      fill
                      className="ak-family-detail__highlight-card-img"
                      sizes="(max-width: 40rem) 90vw, 30vw"
                    />
                  )}
                </div>
                <p className="ak-family-detail__highlight-card-description">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

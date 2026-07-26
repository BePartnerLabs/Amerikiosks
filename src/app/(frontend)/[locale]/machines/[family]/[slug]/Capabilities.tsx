import Image from 'next/image'
import type { Machine, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'

type Props = {
  capabilities: NonNullable<Machine['capabilities']>
  gallery?: Machine['gallery']
}

export const Capabilities: React.FC<Props> = ({ capabilities, gallery }) => {
  const items = capabilities.items ?? []
  if (items.length === 0) return null

  const midpoint = Math.ceil(items.length / 2)
  const columnA = items.slice(0, midpoint)
  const columnB = items.slice(midpoint)
  const photos = (gallery ?? []).slice(0, 3)

  return (
    <section className="ak-machine-detail__capabilities">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__capabilities-inner">
          <div className="ak-machine-detail__capabilities-text">
            {capabilities.heading && (
              <h2 className="ak-machine-detail__capabilities-heading">{capabilities.heading}</h2>
            )}
            <div className="ak-machine-detail__capabilities-columns">
              <ul className="ak-machine-detail__capabilities-list">
                {columnA.map((item, i) => (
                  <li key={item.id ?? `a-${i}`}>{item.text}</li>
                ))}
              </ul>
              <ul className="ak-machine-detail__capabilities-list">
                {columnB.map((item, i) => (
                  <li key={item.id ?? `b-${i}`}>{item.text}</li>
                ))}
              </ul>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="ak-machine-detail__capabilities-carousel">
              {photos.map((item, i) => {
                const image = typeof item.image === 'object' ? (item.image as Media) : null
                if (!image?.url) return null
                return (
                  <div
                    key={item.id ?? i}
                    className="ak-machine-detail__capabilities-photo"
                  >
                    <Image
                      src={getBestMediaUrl(image, 600) ?? image.url}
                      alt=""
                      fill
                      className="ak-machine-detail__capabilities-photo-img"
                      sizes="(max-width: 640px) 90vw, 33vw"
                    />
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

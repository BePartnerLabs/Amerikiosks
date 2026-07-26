import Image from 'next/image'
import type { Machine, Media } from '@/payload-types'

type Props = {
  diagrams: NonNullable<Machine['dimensionDiagrams']>
  dimensions?: Machine['dimensions']
}

export const Dimensions: React.FC<Props> = ({ diagrams, dimensions }) => {
  if (diagrams.length === 0) return null

  return (
    <section className="ak-machine-detail__dimensions">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__dimensions-inner">
          <p className="ak-machine-detail__dimensions-label">DIMENSIONS</p>

          <div className="ak-machine-detail__dimensions-diagrams">
            {diagrams.map((diagram, i) => {
              const image = typeof diagram.image === 'object' ? (diagram.image as Media) : null
              if (!image?.url) return null
              return (
                <figure
                  key={diagram.id ?? i}
                  className="ak-machine-detail__dimensions-diagram"
                >
                  <div className="ak-machine-detail__dimensions-diagram-image">
                    <Image
                      src={image.url}
                      alt={diagram.label ?? ''}
                      fill
                      className="ak-machine-detail__dimensions-diagram-img"
                      sizes="(max-width: 640px) 90vw, 33vw"
                    />
                  </div>
                  {diagram.label && (
                    <figcaption className="ak-machine-detail__dimensions-diagram-label">
                      {diagram.label}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>

          {dimensions && (dimensions.height || dimensions.width || dimensions.depth) && (
            <dl className="ak-machine-detail__dimensions-values">
              {dimensions.height && (
                <div>
                  <dt>Height</dt>
                  <dd>{dimensions.height}</dd>
                </div>
              )}
              {dimensions.width && (
                <div>
                  <dt>Width</dt>
                  <dd>{dimensions.width}</dd>
                </div>
              )}
              {dimensions.depth && (
                <div>
                  <dt>Depth</dt>
                  <dd>{dimensions.depth}</dd>
                </div>
              )}
            </dl>
          )}

          <p className="ak-machine-detail__dimensions-caption">
            Dimensions are approximate and may vary.
          </p>
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'
import { ModelLinesCarousel } from '@/blocks/ModelLines/CarouselNav'
import '@/blocks/ModelLines/styles.css'
import { Link } from '@/i18n/routing'
import type { Machine, Media } from '@/payload-types'
import { vtName } from '@/utilities/viewTransitionName'

type Props = {
  familySlug: string
  models: Machine[]
  // Required so the server-rendered Link below never falls back to next-intl's
  // own getLocale() — that reads headers and breaks static generation for this
  // page (see the machines pages' DYNAMIC_SERVER_USAGE fix).
  locale: 'en' | 'es'
}

// Reuses the exact ak-model-lines panel styling from the home page's
// "explore our systems" carousel, scoped to models within a family.
const ACCENTS = ['#ff6b3d', '#3fb0ff', '#7cd992', '#c58cff', '#ffd166', '#ff8fb1']

export const ModelsCarousel: React.FC<Props> = ({ familySlug, models, locale }) => {
  if (models.length === 0) return null

  return (
    <section className="ak-model-lines ak-family-detail__models-carousel">
      <div className="bp-content-grid">
        <div className="breakout ak-model-lines__inner">
          <ModelLinesCarousel>
            {models.map((machine, i) => {
              const image = typeof machine.image === 'object' ? (machine.image as Media) : null
              const accent = ACCENTS[i % ACCENTS.length]

              return (
                <Link
                  key={machine.id}
                  href={{
                    pathname: '/machines/[family]/[slug]',
                    params: { family: familySlug, slug: machine.slug ?? '' },
                  }}
                  locale={locale}
                  className="ak-model-lines__panel"
                  style={{ '--_accent': accent } as React.CSSProperties}
                  data-ga-event="machine_model_click"
                  data-ga-label={machine.name}
                >
                  {image?.url && (
                    <div
                      className="ak-model-lines__panel-art"
                      style={vtName('machine-image', machine.slug)}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        className="ak-model-lines__panel-img"
                        sizes="(max-width: 640px) 78vw, 23rem"
                      />
                    </div>
                  )}
                  <div className="ak-model-lines__panel-body">
                    <p
                      className="ak-model-lines__panel-name"
                      style={vtName('machine-name', machine.slug)}
                    >
                      {machine.name}
                    </p>
                    {machine.tagline && (
                      <p className="ak-model-lines__panel-tagline">{machine.tagline}</p>
                    )}
                    <span className="ak-model-lines__panel-cta">
                      Learn more
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 3l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </ModelLinesCarousel>
        </div>
      </div>
    </section>
  )
}

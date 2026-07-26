import Image from 'next/image'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { Link } from '@/i18n/routing'
import type { MachineFamily, Media, ModelLinesBlock as ModelLinesBlockProps } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { vtName } from '@/utilities/viewTransitionName'
import { ModelLinesCarousel } from './CarouselNav'
import './styles.css'

type Props = ModelLinesBlockProps & {
  families: MachineFamily[]
  // Required so the server-rendered Link below never falls back to next-intl's
  // own getLocale() — that reads headers and breaks static generation for any
  // page using this block (see the machines pages' DYNAMIC_SERVER_USAGE fix).
  locale: 'en' | 'es'
}

// Cycled by index, not tied to a specific family — new families just pick up the next hue.
const ACCENTS = ['#ff6b3d', '#3fb0ff', '#7cd992', '#c58cff', '#ffd166', '#ff8fb1']

export const ModelLinesBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  families,
  locale,
}) => {
  if (!heading || families.length === 0) return null

  return (
    <section
      className="ak-model-lines"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-model-lines__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={heading}
            subtitle={subheading}
            align="left"
          />

          <ModelLinesCarousel>
            {families.map((family, i) => {
              const thumbnail =
                typeof family.thumbnail === 'object' ? (family.thumbnail as Media) : null
              const hoverThumbnail =
                typeof family.hoverThumbnail === 'object' ? (family.hoverThumbnail as Media) : null
              const accent = ACCENTS[i % ACCENTS.length]

              return (
                <Link
                  key={family.id}
                  href={{ pathname: '/machines/[family]', params: { family: family.slug ?? '' } }}
                  locale={locale}
                  className="ak-model-lines__panel"
                  style={{ '--_accent': accent } as React.CSSProperties}
                  data-ga-event="machine_family_click"
                  data-ga-label={family.name}
                >
                  {thumbnail?.url && (
                    <div
                      className={`ak-model-lines__panel-art${hoverThumbnail?.url ? ' ak-model-lines__panel-art--has-hover' : ''}`}
                      style={vtName('family-image', family.slug)}
                    >
                      <Image
                        src={getBestMediaUrl(thumbnail, 500) ?? thumbnail.url}
                        alt=""
                        fill
                        className="ak-model-lines__panel-img ak-model-lines__panel-img--front"
                        sizes="(max-width: 640px) 78vw, 23rem"
                      />
                      {hoverThumbnail?.url && (
                        <Image
                          src={getBestMediaUrl(hoverThumbnail, 500) ?? hoverThumbnail.url}
                          alt=""
                          fill
                          className="ak-model-lines__panel-img ak-model-lines__panel-img--hover"
                          sizes="(max-width: 640px) 78vw, 23rem"
                        />
                      )}
                    </div>
                  )}
                  <div className="ak-model-lines__panel-body">
                    <p
                      className="ak-model-lines__panel-name"
                      style={vtName('family-name', family.slug)}
                    >
                      {family.name}
                    </p>
                    {family.tagline && (
                      <p className="ak-model-lines__panel-tagline">{family.tagline}</p>
                    )}
                    <span className="ak-model-lines__panel-cta">
                      {family.ctaLabel || 'Explore'}
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

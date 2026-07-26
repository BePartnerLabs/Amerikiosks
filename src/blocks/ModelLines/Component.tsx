import Image from 'next/image'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { Link } from '@/i18n/routing'
import type { MachineFamily, Media, ModelLinesBlock as ModelLinesBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { ModelLinesCarousel } from './CarouselNav'
import './styles.css'

type Props = ModelLinesBlockProps & { families: MachineFamily[] }

// Cycled by index, not tied to a specific family — new families just pick up the next hue.
const ACCENTS = ['#ff6b3d', '#3fb0ff', '#7cd992', '#c58cff', '#ffd166', '#ff8fb1']

export const ModelLinesBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  families,
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
              const accent = ACCENTS[i % ACCENTS.length]

              return (
                <Link
                  key={family.id}
                  href={{ pathname: '/machines/[family]', params: { family: family.slug ?? '' } }}
                  className="ak-model-lines__panel"
                  style={{ '--_accent': accent } as React.CSSProperties}
                  data-ga-event="machine_family_click"
                  data-ga-label={family.name}
                >
                  {thumbnail?.url && (
                    <div className="ak-model-lines__panel-art">
                      <Image
                        src={thumbnail.url}
                        alt=""
                        fill
                        className="ak-model-lines__panel-img"
                        sizes="(max-width: 640px) 78vw, 23rem"
                      />
                    </div>
                  )}
                  <div className="ak-model-lines__panel-body">
                    <p className="ak-model-lines__panel-name">{family.name}</p>
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

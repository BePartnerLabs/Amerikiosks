import Image from 'next/image'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { Link } from '@/i18n/routing'
import type { FormatsGridBlock as FormatsGridBlockProps, Machine, Media } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type Props = FormatsGridBlockProps & { resolvedMachines?: Machine[] }

export const FormatsGridBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  resolvedMachines = [],
}) => {
  if (!heading) return null

  return (
    <section
      className="ak-formats-grid"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-formats-grid__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={heading}
            subtitle={subheading}
            align="center"
          />

          {resolvedMachines.length > 0 && (
            <div className="ak-formats-grid__grid">
              {resolvedMachines.map((machine) => {
                const image = typeof machine.image === 'object' ? (machine.image as Media) : null

                return (
                  <Link
                    key={machine.id}
                    href={{ pathname: '/machines/[slug]', params: { slug: machine.slug } }}
                    className="bp-card bp-card--interactive ak-formats-grid__card"
                    data-ga-event="machine_card_click"
                    data-ga-label={machine.name}
                    aria-label={machine.name}
                  >
                    {image?.url && (
                      <div className="bp-card__image ak-formats-grid__card-image">
                        <Image
                          src={image.url}
                          alt={machine.name}
                          fill
                          className="ak-formats-grid__img"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    )}
                    <div className="bp-card__body ak-formats-grid__card-body">
                      <p className="ak-formats-grid__card-name">{machine.name}</p>
                      {machine.tagline && (
                        <p className="ak-formats-grid__card-tagline">{machine.tagline}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

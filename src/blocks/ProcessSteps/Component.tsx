import Link from 'next/link'
import type React from 'react'
import RichText from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import type { ProcessStepsBlock as ProcessStepsBlockType } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { ProcessStepsCarousel } from './CarouselNav'
import './styles.css'

export const ProcessStepsBlock: React.FC<ProcessStepsBlockType> = ({
  eyebrow,
  heading,
  subheading,
  steps,
  cta,
  blockName,
  blockType,
}) => {
  if (!heading) return null

  const ctaLink = (
    cta as
      | Array<{
          link: { label?: string | null; url?: string | null; type?: string | null }
          id?: string | null
        }>
      | undefined
  )?.[0]?.link

  return (
    <section
      className="ak-process-steps"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-process-steps__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={heading}
            subtitle={subheading}
            align="center"
          />

          {steps && steps.length > 0 && (
            <ProcessStepsCarousel>
              {steps.map((step, index) => (
                <li
                  key={step.id ?? index}
                  className="ak-process-steps__item"
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  <span
                    className="ak-process-steps__number"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="ak-process-steps__content">
                    <p className="ak-process-steps__title">{step.title}</p>
                    {step.body && (
                      <RichText
                        data={step.body}
                        enableGutter={false}
                        className="ak-process-steps__body"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ProcessStepsCarousel>
          )}

          {ctaLink && (
            <div className="ak-process-steps__cta">
              <Link
                href={ctaLink.url ?? '#'}
                className="bp-btn bp-btn--outline"
                data-ga-event="cta_click"
                data-ga-label={ctaLink.label ?? ''}
              >
                {ctaLink.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

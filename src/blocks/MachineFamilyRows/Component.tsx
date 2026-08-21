import Image from 'next/image'
import type React from 'react'
import { Link } from '@/i18n/navigation'
import type { FamilyRow } from './types'
import './styles.css'

type Props = {
  eyebrow: string | null
  heading: string
  intro: string | null
  countEyebrow: string | null
  ctaLabel: string | null
  soonLabel: string | null
  soonCtaLabel: string | null
  families: FamilyRow[]
  // Passed down rather than read here, so this stays a plain synchronous
  // component and the server-rendered Link never falls back to next-intl's
  // getLocale() — that reads headers and breaks these routes (see the
  // DYNAMIC_SERVER_USAGE note in the project's CLAUDE.md).
  locale: 'en' | 'es'
}

export const MachineFamilyRowsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  intro,
  countEyebrow,
  ctaLabel,
  soonLabel,
  soonCtaLabel,
  families,
  locale,
}) => (
  <section
    className="ak-family-rows"
    data-ga-block="machineFamilyRows"
  >
    <div className="bp-content-grid">
      <div className="content ak-family-rows__inner">
        <header className="ak-family-rows__head">
          {eyebrow && <p className="ak-family-rows__eyebrow">{eyebrow}</p>}
          <h2 className="ak-family-rows__heading">{heading}</h2>
          {intro && <p className="ak-family-rows__intro">{intro}</p>}
        </header>

        <ul className="ak-family-rows__list">
          {families.map((family) => {
            // The whole state hangs off this one derived boolean: an editor
            // cannot leave a "coming soon" label up after the first model ships.
            const soon = family.modelCount === 0

            return (
              <li
                key={family.id}
                className="ak-family-rows__item"
              >
                <Link
                  href={{ pathname: '/machines/[family]', params: { family: family.slug } }}
                  locale={locale}
                  className="ak-family-rows__row"
                  data-ga-event="machine_family_click"
                  data-ga-label={family.name}
                >
                  <div className="ak-family-rows__well">
                    {family.imageUrl && (
                      <Image
                        src={family.imageUrl}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="13rem"
                        className="ak-family-rows__shot"
                      />
                    )}
                  </div>

                  <div className="ak-family-rows__body">
                    <p
                      className={`ak-family-rows__badge${soon ? ' ak-family-rows__badge--soon' : ''}`}
                    >
                      {soon
                        ? soonLabel
                        : [family.modelCount, countEyebrow].filter(Boolean).join(' ')}
                    </p>
                    <p className="ak-family-rows__name">{family.name}</p>
                    {family.tagline && <p className="ak-family-rows__tagline">{family.tagline}</p>}
                  </div>

                  <span
                    className={`bp-btn ${soon ? 'bp-btn--ghost' : 'bp-btn--secondary'} ak-family-rows__cta`}
                  >
                    {soon ? soonCtaLabel : (family.ctaLabel ?? ctaLabel)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  </section>
)

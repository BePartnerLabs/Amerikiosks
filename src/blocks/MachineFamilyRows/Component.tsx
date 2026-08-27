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
  countEyebrowOne: string | null
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
  countEyebrowOne,
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
            // Spanish and English both break at one, and one is not a corner
            // case here — a family has exactly one model today. Falls back to
            // the plural label so an empty field degrades to the old wording
            // rather than to a bare number.
            const countLabel =
              family.modelCount === 1 ? (countEyebrowOne ?? countEyebrow) : countEyebrow

            return (
              <li
                key={family.id}
                className="ak-family-rows__item"
              >
                <Link
                  href={{ pathname: '/machines/[family]', params: { family: family.slug } }}
                  locale={locale}
                  className={`ak-family-rows__row${family.leansOut ? ' ak-family-rows__row--leans' : ''}`}
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
                        sizes="(max-width: 46rem) 6rem, 11.5rem"
                        className="ak-family-rows__shot"
                      />
                    )}
                  </div>

                  <div className="ak-family-rows__body">
                    <p
                      className={`ak-family-rows__badge${soon ? ' ak-family-rows__badge--soon' : ''}`}
                    >
                      {/* Not filter(Boolean): that drops a zero. It cannot reach
                          here today because `soon` intercepts it, but the day the
                          soon state keys off anything else the count would
                          vanish and leave the label bare. */}
                      {soon
                        ? soonLabel
                        : `${family.modelCount}${countLabel ? ` ${countLabel}` : ''}`}
                    </p>
                    <p className="ak-family-rows__name">{family.name}</p>
                    {family.featured && (
                      <>
                        <p className="ak-family-rows__featured">{family.featured.title}</p>
                        {family.featured.description && (
                          <p className="ak-family-rows__featured-text">
                            {family.featured.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <span
                    className={`bp-btn bp-btn--outline ak-family-rows__cta${soon ? ' ak-family-rows__cta--soon' : ''}`}
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

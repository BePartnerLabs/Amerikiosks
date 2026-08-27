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
      <div className="content ak-family-rows__head">
        {eyebrow && <p className="ak-family-rows__eyebrow">{eyebrow}</p>}
        <h2 className="ak-family-rows__heading">{heading}</h2>
        {intro && <p className="ak-family-rows__intro">{intro}</p>}
      </div>
    </div>

    <div className="bp-content-grid">
      {/* Breakout: the track runs edge to edge so the cards either side of the
          centre one stay half-visible, which is what tells a visitor there is
          more to the left and to the right without a control saying so. */}
      <div className="breakout ak-family-rows__viewport">
        <ul className="ak-family-rows__track">
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
            const cta = soon ? soonCtaLabel : (family.ctaLabel ?? ctaLabel)

            return (
              <li
                key={family.id}
                className={`ak-family-rows__card${family.leansOut ? ' ak-family-rows__card--leans' : ''}`}
              >
                <div className="ak-family-rows__well">
                  {family.imageUrl && (
                    <Image
                      src={family.imageUrl}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 46rem) 78vw, 22rem"
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
                    {soon ? soonLabel : `${family.modelCount}${countLabel ? ` ${countLabel}` : ''}`}
                  </p>

                  {/* The link wraps the name alone and stretches over the card
                      with ::after. With the whole card as one <a> its accessible
                      name was every string inside it concatenated — "2 models
                      Alpha 360° rapid heating …" — five of those in a row. The
                      sr-only suffix repeats the visible CTA verbatim so voice
                      control still matches it (WCAG 2.5.3), and the CTA itself
                      is aria-hidden because it is a decorative duplicate.
                      Same pattern as CardGrid and ModelLines. */}
                  <h3 className="ak-family-rows__name">
                    <Link
                      href={{ pathname: '/machines/[family]', params: { family: family.slug } }}
                      locale={locale}
                      className="ak-family-rows__link"
                      data-ga-event="machine_family_click"
                      data-ga-label={family.name}
                    >
                      {family.name}
                      {cta && <span className="ak-a11y-sr-only">: {cta}</span>}
                    </Link>
                  </h3>

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

                  <span
                    className={`ak-family-rows__cta${soon ? ' ak-family-rows__cta--soon' : ''}`}
                    aria-hidden="true"
                  >
                    {cta}
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  </section>
)

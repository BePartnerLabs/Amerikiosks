import Image from 'next/image'
import type React from 'react'
import { Link } from '@/i18n/navigation'
import { InfiniteTrack } from './InfiniteTrack'
import type { CarouselFamily } from './types'
import './styles.css'

type Props = {
  eyebrow: string | null
  heading: string
  intro: string | null
  families: CarouselFamily[]
  // Passed down rather than read here, so this stays a plain synchronous
  // component and the server-rendered Link never falls back to next-intl's
  // getLocale() — that reads headers and breaks these routes.
  locale: 'en' | 'es'
}

export const MachineFamilyCarouselBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  intro,
  families,
  locale,
}) => (
  <section
    className="ak-family-carousel"
    data-ga-block="machineFamilyCarousel"
  >
    <div className="bp-content-grid">
      <div className="content ak-family-carousel__head">
        {eyebrow && <p className="ak-family-carousel__eyebrow">{eyebrow}</p>}
        <h2 className="ak-family-carousel__heading">{heading}</h2>
        {intro && <p className="ak-family-carousel__intro">{intro}</p>}
      </div>
    </div>

    <div className="bp-content-grid">
      {/* Full width: the machines run off both edges, which is what says the
          track continues without a control announcing it. */}
      <div className="full-width ak-family-carousel__viewport">
        <InfiniteTrack label={heading}>
          {families.map((family) => (
            <li
              key={family.id}
              className="ak-family-carousel__item"
            >
              <Link
                href={{ pathname: '/machines/[family]', params: { family: family.slug } }}
                locale={locale}
                className="ak-family-carousel__link"
                data-ga-event="machine_family_click"
                data-ga-label={family.name}
              >
                {family.imageUrl && (
                  <span className="ak-family-carousel__well">
                    <Image
                      src={family.imageUrl}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 46rem) 62vw, 20rem"
                      className="ak-family-carousel__shot"
                    />
                  </span>
                )}
                <span className="ak-family-carousel__name">{family.name}</span>
              </Link>
            </li>
          ))}
        </InfiniteTrack>
      </div>
    </div>
  </section>
)

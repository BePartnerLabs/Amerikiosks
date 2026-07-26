import Image from 'next/image'
import { Link } from '@/i18n/routing'
import type { MachineFamily, Media } from '@/payload-types'
import './styles.css'

type Props = {
  families: MachineFamily[]
  activeSlug?: string
  // Required so the server-rendered Link below never falls back to next-intl's
  // own getLocale() — that reads headers and breaks static generation for any
  // page using this component (see the machines pages' DYNAMIC_SERVER_USAGE fix).
  locale: 'en' | 'es'
}

export const ModelLinesRow: React.FC<Props> = ({ families, activeSlug, locale }) => {
  if (families.length === 0) return null

  return (
    <div className="ak-model-lines-row">
      {families.map((family) => {
        const thumbnail = typeof family.thumbnail === 'object' ? (family.thumbnail as Media) : null
        const isActive = family.slug === activeSlug

        return (
          <Link
            key={family.id}
            href={{ pathname: '/machines/[family]', params: { family: family.slug ?? '' } }}
            locale={locale}
            className={`ak-model-lines-row__item${isActive ? ' ak-model-lines-row__item--active' : ''}`}
            data-ga-event="machine_family_click"
            data-ga-label={family.name}
          >
            {thumbnail?.url && (
              <div className="ak-model-lines-row__thumb">
                <Image
                  src={thumbnail.url}
                  alt={family.name}
                  fill
                  className="ak-model-lines-row__img"
                  sizes="120px"
                />
              </div>
            )}
            <span className="ak-model-lines-row__name">{family.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

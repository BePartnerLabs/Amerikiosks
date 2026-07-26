import Image from 'next/image'
import { Link } from '@/i18n/routing'
import type { MachineFamily, Media } from '@/payload-types'
import './styles.css'

type Props = {
  families: MachineFamily[]
  activeSlug?: string
}

export const ModelLinesRow: React.FC<Props> = ({ families, activeSlug }) => {
  if (families.length === 0) return null

  return (
    <div className="ak-model-lines-row">
      {families.map((family) => {
        const thumbnail = typeof family.thumbnail === 'object' ? (family.thumbnail as Media) : null
        const isActive = family.slug === activeSlug

        return (
          <Link
            key={family.id}
            href={{ pathname: '/machines/[slug]', params: { slug: family.slug ?? '' } }}
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

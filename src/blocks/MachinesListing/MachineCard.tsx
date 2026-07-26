'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import type { Machine, MachineFamily, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { useInView } from '@/utilities/useInView'

type Props = {
  machine: Machine
  index?: number
}

export const MachineCard: React.FC<Props> = ({ machine, index = 0 }) => {
  const { ref, inView } = useInView<HTMLAnchorElement>()
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const familySlug =
    typeof machine.family === 'object' ? (machine.family as MachineFamily).slug : null
  const delay = (index % 6) * 70

  if (!familySlug) return null

  return (
    <Link
      ref={ref}
      href={{
        pathname: '/machines/[family]/[slug]',
        params: { family: familySlug, slug: machine.slug },
      }}
      className={`bp-card bp-card--interactive ak-machines-listing__card${inView ? ' ak-machines-listing__card--in-view' : ''}`}
      style={{ transitionDelay: `${delay}ms` } as React.CSSProperties}
      data-ga-event="machine_card_click"
      data-ga-label={machine.name}
    >
      {image?.url && (
        <div className="ak-machines-listing__card-image">
          <Image
            src={getBestMediaUrl(image, 600) ?? image.url}
            alt={machine.name}
            fill
            className="ak-machines-listing__card-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="ak-machines-listing__card-body">
        <p className="ak-machines-listing__card-name">{machine.name}</p>
        {machine.tagline && <p className="ak-machines-listing__card-tagline">{machine.tagline}</p>}
        <span className="bp-btn bp-btn--dark ak-machines-listing__card-button">Learn more</span>
      </div>
    </Link>
  )
}

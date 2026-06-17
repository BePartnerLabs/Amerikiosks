'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Machine, Media } from '@/payload-types'
import { useInView } from '@/utilities/useInView'

type Props = {
  machine: Machine
  index?: number
}

export const MachineTile: React.FC<Props> = ({ machine, index = 0 }) => {
  const { ref, inView } = useInView<HTMLAnchorElement>()
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const ratio = image?.width && image?.height ? image.width / image.height : 4 / 3
  const delay = (index % 6) * 70

  return (
    <Link
      ref={ref}
      href={`/machines/${machine.slug}`}
      className={`bp-card bp-card--interactive ak-machines-page__tile${inView ? ' ak-machines-page__tile--in-view' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      data-ga-event="machine_tile_click"
      data-ga-label={machine.name}
    >
      {image?.url && (
        <div
          className="ak-machines-page__tile-image"
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={image.url}
            alt={machine.name}
            fill
            className="ak-machines-page__tile-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="ak-machines-page__tile-body">
        <p className="ak-machines-page__tile-name">{machine.name}</p>
        {machine.tagline && <p className="ak-machines-page__tile-tagline">{machine.tagline}</p>}
      </div>
    </Link>
  )
}

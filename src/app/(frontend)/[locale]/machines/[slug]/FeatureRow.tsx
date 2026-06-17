'use client'

import Image from 'next/image'
import { useInView } from '@/utilities/useInView'

type Props = {
  heading: string
  body?: string | null
  imageUrl: string
  imageAlt: string
  reverse?: boolean
}

export const FeatureRow: React.FC<Props> = ({ heading, body, imageUrl, imageAlt, reverse }) => {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`bp-content-grid ak-machine-detail__feature-row${reverse ? ' ak-machine-detail__feature-row--reverse' : ''}${inView ? ' ak-machine-detail__feature-row--in-view' : ''}`}
    >
      <div className="content ak-machine-detail__feature-inner">
        {imageUrl && (
          <div className="ak-machine-detail__feature-image">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="ak-machine-detail__feature-img"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        )}
        <div className="ak-machine-detail__feature-text">
          <h2 className="ak-machine-detail__feature-heading">{heading}</h2>
          {body && <p className="ak-machine-detail__feature-body">{body}</p>}
        </div>
      </div>
    </div>
  )
}

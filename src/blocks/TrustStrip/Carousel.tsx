'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { TrustStripTracker } from './Tracker'

type CarouselPartner = {
  id: string
  name: string
  logoUrl: string
}

export const TrustStripCarousel: React.FC<{ partners: CarouselPartner[] }> = ({ partners }) => {
  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div
        ref={viewportRef}
        className="ak-trust-strip__viewport"
      >
        {[0, 1].map((i) => (
          <ul
            key={i}
            className="ak-trust-strip__track"
            aria-hidden={i === 1 ? 'true' : undefined}
          >
            {partners.map((partner) => (
              <li
                key={`${i}-${partner.id}`}
                className="ak-trust-strip__card"
              >
                <Image
                  src={partner.logoUrl}
                  alt={partner.name}
                  width={120}
                  height={60}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <TrustStripTracker containerRef={viewportRef} />
    </>
  )
}

'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { TrustStripTracker } from './Tracker'

type CarouselPartner = {
  id: string | number
  name: string
  logoUrl: string
}

// Each track must be at least as wide as the widest viewport we support (up to
// ~5K ultrawide) for the two-track translateX(-100%) loop to stay seamless —
// otherwise the track runs out of logos before it fully slides off and the
// gap becomes visible. Repeating the partner list inside each track (rather
// than adding more sibling tracks) is what grows a single track's own width.
const MIN_TRACK_WIDTH_PX = 5120
const CARD_WIDTH_PX = 188
const CARD_GAP_PX = 16

export const TrustStripCarousel: React.FC<{ partners: CarouselPartner[] }> = ({ partners }) => {
  const viewportRef = useRef<HTMLDivElement>(null)

  const singleSetWidth = partners.length * (CARD_WIDTH_PX + CARD_GAP_PX)
  const repeatCount = Math.max(1, Math.ceil(MIN_TRACK_WIDTH_PX / singleSetWidth))
  const repeatedPartners = Array.from({ length: repeatCount }, () => partners).flat()

  return (
    <>
      <div
        ref={viewportRef}
        className="ak-trust-strip__viewport"
        aria-live="off"
      >
        {[0, 1].map((i) => (
          <ul
            key={i}
            className="ak-trust-strip__track"
            aria-hidden={i === 1 ? 'true' : undefined}
          >
            {repeatedPartners.map((partner, index) => (
              <li
                key={`${i}-${partner.id}-${index}`}
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

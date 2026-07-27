'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { TrustStripPauseToggle } from './PauseToggle'
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
const LOGO_WIDTH_PX = 96
const LOGO_GAP_PX = 40

// Two independent rows scrolling in opposite directions — a denser, plainer
// alternative to the single-row bordered-card marquee: no card container,
// just full-color logos, so it reads as a river of marks rather than a
// row of tiles.
const ROWS = [
  { key: 'row-a', direction: 'forward' as const },
  { key: 'row-b', direction: 'reverse' as const },
]

export const TrustStripCarousel: React.FC<{ partners: CarouselPartner[] }> = ({ partners }) => {
  const viewportRef = useRef<HTMLDivElement>(null)

  const singleSetWidth = partners.length * (LOGO_WIDTH_PX + LOGO_GAP_PX)
  const repeatCount = Math.max(1, Math.ceil(MIN_TRACK_WIDTH_PX / singleSetWidth))
  const repeatedPartners = Array.from({ length: repeatCount }, () => partners).flat()

  return (
    <>
      <TrustStripPauseToggle viewportRef={viewportRef} />
      <div
        ref={viewportRef}
        className="ak-trust-strip__viewport"
        aria-live="off"
      >
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="ak-trust-strip__row"
            data-direction={row.direction}
          >
            {[0, 1].map((i) => (
              <ul
                key={i}
                className="ak-trust-strip__track"
                aria-hidden={i === 1 || row.key !== 'row-a' ? 'true' : undefined}
              >
                {repeatedPartners.map((partner, index) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: repeatedPartners repeats the same static partners array N times for the marquee effect — partner.id alone duplicates across repetitions, and the list is never reordered/filtered, so index is a safe disambiguator here, not a list-identity risk.
                    key={`${row.key}-${i}-${partner.id}-${index}`}
                    className="ak-trust-strip__card"
                  >
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={96}
                      height={48}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
      <TrustStripTracker containerRef={viewportRef} />
    </>
  )
}

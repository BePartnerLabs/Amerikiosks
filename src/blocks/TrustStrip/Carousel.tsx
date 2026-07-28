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
// Keep in step with the .ak-trust-strip__card width in styles.css — this is
// what the repeat count above is derived from, so a mismatch reintroduces
// the visible gap in the loop.
const LOGO_WIDTH_PX = 96
const LOGO_GAP_PX = 48

// Below this count everything fits comfortably on one line. Past it, split
// into two rows (interleaved so both stay visually balanced) scrolling in
// opposite directions — a single overlong row would either shrink logos too
// far or force a giant viewport width.
const MAX_PER_ROW = 14

type Row = { key: string; direction: 'forward' | 'reverse'; partners: CarouselPartner[] }

function buildRows(partners: CarouselPartner[]): Row[] {
  if (partners.length <= MAX_PER_ROW) {
    return [{ key: 'row-a', direction: 'forward', partners }]
  }

  const rowA: CarouselPartner[] = []
  const rowB: CarouselPartner[] = []
  partners.forEach((partner, index) => {
    ;(index % 2 === 0 ? rowA : rowB).push(partner)
  })

  return [
    { key: 'row-a', direction: 'forward', partners: rowA },
    { key: 'row-b', direction: 'reverse', partners: rowB },
  ]
}

function repeatForSeamlessLoop(partners: CarouselPartner[]): CarouselPartner[] {
  const singleSetWidth = partners.length * (LOGO_WIDTH_PX + LOGO_GAP_PX)
  const repeatCount = Math.max(1, Math.ceil(MIN_TRACK_WIDTH_PX / singleSetWidth))
  return Array.from({ length: repeatCount }, () => partners).flat()
}

export const TrustStripCarousel: React.FC<{ partners: CarouselPartner[] }> = ({ partners }) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const rows = buildRows(partners)

  return (
    <>
      <TrustStripPauseToggle viewportRef={viewportRef} />
      <div
        ref={viewportRef}
        className="ak-trust-strip__viewport"
        aria-live="off"
      >
        {rows.map((row) => {
          const repeated = repeatForSeamlessLoop(row.partners)
          return (
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
                  {repeated.map((partner, index) => (
                    <li
                      // biome-ignore lint/suspicious/noArrayIndexKey: repeated repeats the same static partners array N times for the marquee effect — partner.id alone duplicates across repetitions, and the list is never reordered/filtered, so index is a safe disambiguator here, not a list-identity risk.
                      key={`${row.key}-${i}-${partner.id}-${index}`}
                      className="ak-trust-strip__card"
                    >
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        width={96}
                        height={48}
                      />
                      <span
                        className="ak-trust-strip__card-name"
                        aria-hidden="true"
                      >
                        {partner.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )
        })}
      </div>
      <TrustStripTracker containerRef={viewportRef} />
    </>
  )
}

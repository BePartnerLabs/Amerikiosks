'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { LineupFamily } from './types'
import './styles.css'

const HEADER_OFFSET_PX = 62

type Props = {
  intro: string | null
  families: LineupFamily[]
  jsonLd?: Record<string, unknown>
}

/**
 * The pinned dark scene. It stays fixed while the scroll drives it: the machine
 * rises and turns, and the copy steps through the families — one machine and one
 * characteristic each.
 *
 * This replaces the selector-driven version, where the scroll stepped through a
 * single family's highlights and a click elsewhere chose which family. The axis
 * is now the families themselves, so nothing is hidden and nothing pretends to
 * be navigation.
 *
 * Falls back to a plain stacked list under `prefers-reduced-motion`.
 */
export const MachineLineupBlock: React.FC<Props> = ({ intro, families, jsonLd }) => {
  // Compiled by the React Compiler (annotation mode, see next.config.ts). Same
  // reason as the scene this replaces: the scroll handler sets state on every
  // animation frame, so this re-renders continuously while on screen and
  // recomputes its per-family derived values each time.
  'use memo'

  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const section = sectionRef.current
      const pin = pinRef.current
      if (!section || !pin) return
      const rect = section.getBoundingClientRect()
      const travel = Math.max(1, rect.height - pin.offsetHeight)
      setProgress(Math.min(1, Math.max(0, (-rect.top + HEADER_OFFSET_PX) / travel)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  if (reduced) {
    return (
      <section
        className="ak-lineup ak-lineup--static"
        data-ga-block="machineLineup"
      >
        {intro && <p className="ak-lineup__intro">{intro}</p>}
        <ul className="ak-lineup__list">
          {families.map((family) => (
            <li
              className="ak-lineup__item"
              key={family.id}
            >
              {family.frontUrl && (
                <Image
                  src={family.frontUrl}
                  alt={family.name}
                  width={220}
                  height={280}
                  quality={100}
                  className="ak-lineup__static-img"
                />
              )}
              <div>
                <p className="ak-lineup__eyebrow">{family.name}</p>
                {family.featured && (
                  <>
                    <h2 className="ak-lineup__title">{family.featured.title}</h2>
                    {family.featured.description && (
                      <p className="ak-lineup__text">{family.featured.description}</p>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const index = Math.min(families.length - 1, Math.floor(progress * families.length))
  const active = families[index]
  // Each family owns a slice of the scroll; the turn runs inside its own slice
  // so every machine completes a full rotation rather than one long sweep.
  const slice = 1 / families.length
  const within = Math.min(1, Math.max(0, (progress - index * slice) / slice))
  const turn = Math.min(1, Math.max(0, (within - 0.25) / 0.4))

  return (
    <section
      className="ak-lineup"
      data-ga-block="machineLineup"
      ref={sectionRef}
      style={{ '--ak-lineup-count': families.length } as React.CSSProperties}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld built from Payload data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div
        className="ak-lineup__pin"
        ref={pinRef}
        style={
          {
            '--ak-lineup-progress': progress.toFixed(3),
            '--ak-lineup-turn': turn.toFixed(3),
          } as React.CSSProperties
        }
      >
        <span className="ak-lineup__glow" />

        <div className="ak-lineup__stage">
          {families.map((family, position) => (
            <div
              className={`ak-lineup__unit${position === index ? ' ak-lineup__unit--on' : ''}`}
              key={family.id}
              aria-hidden={position === index ? undefined : 'true'}
            >
              {family.frontUrl && (
                <Image
                  src={family.frontUrl}
                  alt={family.name}
                  fill
                  priority={position === 0}
                  sizes="(max-width: 720px) 60vw, 340px"
                  quality={100}
                  className="ak-lineup__img ak-lineup__img--front"
                />
              )}
              {family.turnUrl && (
                <Image
                  src={family.turnUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 720px) 60vw, 340px"
                  quality={100}
                  className="ak-lineup__img ak-lineup__img--side"
                />
              )}
            </div>
          ))}
        </div>

        <div className="ak-lineup__copy">
          {intro && progress < 0.02 && <p className="ak-lineup__intro">{intro}</p>}
          {families.map((family, position) => (
            <div
              className={`ak-lineup__step${position === index ? ' ak-lineup__step--on' : ''}`}
              key={family.id}
            >
              <p className="ak-lineup__eyebrow">{family.name}</p>
              {family.featured && (
                <>
                  <h2 className="ak-lineup__title">{family.featured.title}</h2>
                  {family.featured.description && (
                    <p className="ak-lineup__text">{family.featured.description}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {active && (
          <Link
            className="ak-lineup__link"
            href={{ pathname: '/machines/[family]', params: { family: active.slug } }}
            data-ga-event="machine_family_click"
          >
            {active.name}
          </Link>
        )}

        <div
          className="ak-lineup__progress"
          aria-hidden="true"
        >
          {families.map((family, position) => (
            <span
              className={
                position <= index ? 'ak-lineup__tick ak-lineup__tick--on' : 'ak-lineup__tick'
              }
              key={family.id}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

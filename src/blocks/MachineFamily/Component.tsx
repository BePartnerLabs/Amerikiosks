'use client'

import Image from 'next/image'
import { type PointerEvent, useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { FamilySection } from './types'
import './styles.css'

type TileProps = {
  className: string
  eyebrow: string
  title?: string
  text?: string | null
  imageUrl?: string | null
  imageClass?: string
  index: number
  children?: React.ReactNode
}

const Tile: React.FC<TileProps> = ({
  className,
  eyebrow,
  title,
  text,
  imageUrl,
  imageClass,
  index,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        window.setTimeout(() => setShown(true), index * 80)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [index])

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--ak-famtile-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--ak-famtile-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      className={`ak-famtile ${className}${shown ? ' ak-famtile--in' : ''}`}
      onPointerMove={onMove}
    >
      <span className="ak-famtile__glow" />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="320px"
          quality={100}
          className={`ak-famtile__img ${imageClass ?? ''}`}
        />
      )}
      <p className="ak-famtile__eyebrow">{eyebrow}</p>
      {title && <h3 className="ak-famtile__title">{title}</h3>}
      {text && <p className="ak-famtile__text">{text}</p>}
      {children}
    </div>
  )
}

type Props = {
  section: FamilySection
  tileEyebrow?: string | null
  leadEyebrow?: string | null
  countEyebrow?: string | null
  showModelCount?: boolean | null
}

/**
 * One family, shown in full. The editor picks which family; the visitor picks
 * nothing — that is the point. The previous version of this section read the
 * family from a selector that hid four lines out of five and never changed the
 * URL.
 */
export const MachineFamilyBlock: React.FC<Props> = ({
  section,
  tileEyebrow,
  leadEyebrow,
  countEyebrow,
  showModelCount,
}) => {
  const [lead, ...rest] = section.highlights
  if (!lead) return null

  // The renders double as the feature imagery: front, three-quarter, and
  // whatever the machines themselves carry. It keeps the grid visual without
  // asking content editors for four more photos per line.
  const shots = [section.turnUrl, section.frontUrl, ...section.machineShots].filter(
    (url): url is string => Boolean(url),
  )
  const shot = (i: number) => (shots.length ? shots[i % shots.length] : null)

  return (
    <section
      className="ak-family-section"
      data-ga-block="machineFamily"
    >
      <div className="bp-content-grid">
        <div className="content">
          <div className="ak-family-section__head">
            <div>
              <p className="ak-family-section__eyebrow">{section.name}</p>
              <h2 className="ak-family-section__heading">{section.headline ?? section.name}</h2>
              {section.description && (
                <p className="ak-family-section__text">{section.description}</p>
              )}
            </div>
            <Link
              href={{ pathname: '/machines/[family]', params: { family: section.slug } }}
              className="bp-btn bp-btn--secondary"
              data-ga-event="machine_family_click"
            >
              {section.ctaLabel ?? section.name}
            </Link>
          </div>

          <div className="ak-family-section__grid">
            <Tile
              index={0}
              className="ak-famtile--lead"
              eyebrow={leadEyebrow ?? ''}
              title={lead.title}
              text={lead.description}
              imageUrl={lead.imageUrl ?? shot(0)}
              imageClass="ak-famtile__img--lead"
            />

            {showModelCount && section.modelCount > 0 && (
              <Tile
                index={1}
                className="ak-famtile--wide"
                eyebrow={countEyebrow ?? ''}
              >
                <span className="ak-famtile__stat">{section.modelCount}</span>
              </Tile>
            )}

            {rest.slice(0, 2).map((item, i) => (
              <Tile
                key={item.title}
                index={2 + i}
                className=""
                eyebrow={tileEyebrow ?? ''}
                title={item.title}
                text={item.description}
                imageUrl={item.imageUrl ?? shot(i + 1)}
                imageClass="ak-famtile__img--side"
              />
            ))}

            {rest[2] && (
              <Tile
                index={4}
                className="ak-famtile--full"
                eyebrow={tileEyebrow ?? ''}
                title={rest[2].title}
                text={rest[2].description}
                imageUrl={rest[2].imageUrl ?? shot(3)}
                imageClass="ak-famtile__img--tall"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

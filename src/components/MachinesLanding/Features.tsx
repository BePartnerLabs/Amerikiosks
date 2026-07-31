'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type PointerEvent, useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useActiveFamily } from './Provider'

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
    event.currentTarget.style.setProperty('--ak-tile-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--ak-tile-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      className={`ak-tile ${className}${shown ? ' ak-tile--in' : ''}`}
      onPointerMove={onMove}
    >
      <span className="ak-tile__glow" />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="320px"
          quality={100}
          className={`ak-tile__img ${imageClass ?? ''}`}
        />
      )}
      <p className="ak-tile__eyebrow">{eyebrow}</p>
      {title && <h3 className="ak-tile__title">{title}</h3>}
      {text && <p className="ak-tile__text">{text}</p>}
      {children}
    </div>
  )
}

export const MachinesFeatures: React.FC = () => {
  const { active } = useActiveFamily()
  const t = useTranslations('machines')

  const [lead, ...rest] = active.highlights
  if (!lead) return null

  // The renders double as the feature imagery: front, three-quarter, and
  // whatever the machines themselves carry. It keeps the grid visual without
  // asking content editors for four more photos per line.
  const shots = [
    active.hoverUrl,
    active.thumbUrl,
    ...active.machines.map((m) => m.hoverImageUrl ?? m.imageUrl),
  ].filter(Boolean) as string[]
  const shot = (i: number) => (shots.length ? shots[i % shots.length] : null)

  return (
    <section className="ak-features">
      <div className="bp-content-grid">
        <div className="content">
          <div className="ak-features__head">
            <div>
              <p className="ak-features__eyebrow">{active.name}</p>
              <h2 className="ak-features__heading">
                {active.headline ?? active.tagline ?? active.name}
              </h2>
              {active.description && <p className="ak-features__text">{active.description}</p>}
            </div>
            <Link
              href={{ pathname: '/machines/[family]', params: { family: active.slug } }}
              className="bp-btn bp-btn--secondary"
            >
              {active.ctaLabel || t('knowMore')}
            </Link>
          </div>

          <div className="ak-features__grid">
            <Tile
              index={0}
              className="ak-tile--lead"
              eyebrow={t('mainHighlight')}
              title={lead.title}
              text={lead.description}
              imageUrl={lead.imageUrl ?? shot(0)}
              imageClass="ak-tile__img--lead"
            />

            <Tile
              index={1}
              className="ak-tile--wide"
              eyebrow={t('modelsInLine')}
            >
              <span className="ak-tile__stat">{active.machines.length}</span>
            </Tile>

            {rest.slice(0, 2).map((item, i) => (
              <Tile
                key={item.title}
                index={2 + i}
                className=""
                eyebrow={t('feature')}
                title={item.title}
                text={item.description}
                imageUrl={item.imageUrl ?? shot(i + 1)}
                imageClass="ak-tile__img--side"
              />
            ))}

            {rest[2] && (
              <Tile
                index={4}
                className="ak-tile--full"
                eyebrow={t('feature')}
                title={rest[2].title}
                text={rest[2].description}
                imageUrl={rest[2].imageUrl ?? shot(3)}
                imageClass="ak-tile__img--tall"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

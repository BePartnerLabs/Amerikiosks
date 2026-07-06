'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  imageUrl: string
  alt: string
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  brochureUrl?: string | null
  ctaLabel: string
  ctaUrl: string
}

export const ZoomFadeHero: React.FC<Props> = ({
  imageUrl,
  alt,
  eyebrow,
  heading,
  subtitle,
  brochureUrl,
  ctaLabel,
  ctaUrl,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const progress = useScrollProgress(wrapperRef)
  const scale = 1 + progress * 0.12

  return (
    <div className="ak-machine-hero">
      <div className="ak-machine-hero__text">
        {eyebrow && <p className="ak-machine-hero__eyebrow">{eyebrow}</p>}
        <h1 className="ak-machine-hero__heading">{heading}</h1>
        {subtitle && <p className="ak-machine-hero__subtitle">{subtitle}</p>}
        <div className="ak-machine-hero__actions">
          {brochureUrl && (
            <a
              href={brochureUrl}
              className="bp-btn bp-btn--dark"
              download
            >
              Download brochure
            </a>
          )}
          <a
            href={ctaUrl}
            className="bp-btn bp-btn--outline"
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="ak-machine-hero__image-pin-wrapper"
      >
        <div className="ak-machine-hero__sticky">
          <div
            className="ak-machine-hero__image-wrap"
            style={{ transform: `scale(${scale})` }}
          >
            <Image
              src={imageUrl}
              alt={alt}
              fill
              priority
              className="ak-machine-hero__image"
              sizes="100vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

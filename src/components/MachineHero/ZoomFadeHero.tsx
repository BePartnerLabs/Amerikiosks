'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  imageUrl: string
  alt: string
  eyebrow?: string | null
  heading: string
}

export const ZoomFadeHero: React.FC<Props> = ({ imageUrl, alt, eyebrow, heading }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const progress = useScrollProgress(wrapperRef)

  const scale = 1 + progress * 0.12
  const textOpacity = Math.max(0, 1 - progress / 0.4)

  return (
    <div
      ref={wrapperRef}
      className="ak-machine-hero"
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
        <div
          className="ak-machine-hero__text"
          style={{ opacity: textOpacity }}
        >
          {eyebrow && <p className="ak-machine-hero__eyebrow">{eyebrow}</p>}
          <h1 className="ak-machine-hero__heading">{heading}</h1>
        </div>
      </div>
    </div>
  )
}

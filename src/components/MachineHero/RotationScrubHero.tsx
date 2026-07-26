'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CMSLink } from '@/components/Link'
import type { Machine } from '@/payload-types'
import { vtName } from '@/utilities/viewTransitionName'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  frameUrls: string[]
  alt: string
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  brochureUrl?: string | null
  cta: Machine['cta']
  slug?: string | null
}

export const RotationScrubHero: React.FC<Props> = ({
  frameUrls,
  alt,
  eyebrow,
  heading,
  subtitle,
  brochureUrl,
  cta,
  slug,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const [framesReady, setFramesReady] = useState(false)
  const progress = useScrollProgress(wrapperRef)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    let loaded = 0
    const images = frameUrls.map((url) => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        loaded += 1
        if (loaded === frameUrls.length) setFramesReady(true)
      }
      return img
    })
    framesRef.current = images
  }, [frameUrls])

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const frame = framesRef.current[index]
    if (!canvas || !frame) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    const scale = Math.max(canvas.width / frame.width, canvas.height / frame.height)
    const w = frame.width * scale
    const h = frame.height * scale
    ctx.drawImage(frame, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
  }, [])

  useEffect(() => {
    if (!framesReady) return
    const frameIndex = reducedMotion
      ? 0
      : Math.min(frameUrls.length - 1, Math.floor(progress * (frameUrls.length - 1)))
    drawFrame(frameIndex)
  }, [progress, framesReady, reducedMotion, frameUrls.length, drawFrame])

  return (
    <div className="ak-machine-hero">
      <div className="ak-machine-hero__text">
        {eyebrow && <p className="ak-machine-hero__eyebrow">{eyebrow}</p>}
        <h1
          className="ak-machine-hero__heading"
          style={vtName('machine-name', slug)}
        >
          {heading}
        </h1>
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
          <CMSLink
            {...cta}
            appearance={cta?.appearance ?? 'outline'}
          />
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="ak-machine-hero__image-pin-wrapper"
        style={vtName('machine-image', slug)}
      >
        <div className="ak-machine-hero__sticky">
          {!framesReady && (
            <div
              className="ak-machine-hero__skeleton"
              aria-hidden
            />
          )}
          <canvas
            ref={canvasRef}
            className="ak-machine-hero__canvas"
            role="img"
            aria-label={alt}
          />
        </div>
      </div>
    </div>
  )
}

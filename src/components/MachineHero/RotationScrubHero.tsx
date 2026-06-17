'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  frameUrls: string[]
  alt: string
  eyebrow?: string | null
  heading: string
}

export const RotationScrubHero: React.FC<Props> = ({ frameUrls, alt, eyebrow, heading }) => {
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

  const textOpacity = reducedMotion ? 1 : Math.max(0, 1 - progress / 0.4)

  return (
    <div
      ref={wrapperRef}
      className="ak-machine-hero"
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

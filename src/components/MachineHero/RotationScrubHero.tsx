'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CMSLink } from '@/components/Link'
import type { Machine } from '@/payload-types'
import { vtName } from '@/utilities/viewTransitionName'
import { DimensionOverlay } from './DimensionOverlay'
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
  /** URL del anchors.json, resuelta en el servidor. Sin ella no hay cotas. */
  anchorsUrl?: string | null
  /** Los textos publicados, tal cual los guarda /admin: `77"`, `72"`, `39"`. */
  dimensionLabels?: Partial<Record<'height' | 'width' | 'depth', string>> | null
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
  anchorsUrl,
  dimensionLabels,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const wantedIndexRef = useRef(0)
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const progress = useScrollProgress(wrapperRef)
  const reducedMotion = usePrefersReducedMotion()

  const drawRef = useRef<(index: number) => void>(() => {})

  useEffect(() => {
    // Draw as soon as the *first* frame lands rather than waiting for the whole
    // sequence. A 70-frame set is tens of megabytes; blocking on all of it left
    // the skeleton covering the hero for the entire download, which reads as a
    // blank panel where the render should be.
    const images = frameUrls.map((url, index) => {
      const img = new Image()
      img.src = url
      const settle = () => {
        if (index === 0) setFirstFrameReady(true)
        // Redraw if this is the frame the scroll position currently wants, or
        // if it is a better match than whatever is on screen.
        if (index === wantedIndexRef.current) drawRef.current(index)
      }
      img.onload = settle
      // onerror settles too, so one 404 cannot strand the sequence.
      img.onerror = settle
      return img
    })
    framesRef.current = images
  }, [frameUrls])

  // Nearest already-decoded frame, searching outwards. While the sequence is
  // still downloading this keeps a real image on screen instead of a gap.
  const resolveFrame = useCallback((index: number): HTMLImageElement | null => {
    const frames = framesRef.current
    for (let offset = 0; offset < frames.length; offset++) {
      const before = frames[index - offset]
      if (before?.naturalWidth) return before
      const after = frames[index + offset]
      if (after?.naturalWidth) return after
    }
    return null
  }, [])

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      const frame = resolveFrame(index)
      if (!canvas || !frame) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Back the canvas at device resolution, then scale the drawing context back
      // to CSS pixels. Without this a retina screen renders the frames at half
      // resolution, which is exactly where a product render gets judged.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssWidth = canvas.clientWidth
      const cssHeight = canvas.clientHeight
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr
        canvas.height = cssHeight * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      // `contain`, not `cover`: the render is a product shot on a transparent
      // background, so cropping it to fill would cut the machine off.
      const scale = Math.min(cssWidth / frame.naturalWidth, cssHeight / frame.naturalHeight)
      const w = frame.naturalWidth * scale
      const h = frame.naturalHeight * scale
      ctx.drawImage(frame, (cssWidth - w) / 2, (cssHeight - h) / 2, w, h)
    },
    [resolveFrame],
  )

  // Keep the ref pointing at the current closure so an image's onload can
  // redraw without re-subscribing every frame.
  //
  // In an effect, not in the render body: writing a ref during render makes the
  // React Compiler skip this whole file, so nothing here gets memoised — and a
  // component that redraws a canvas on every scroll frame is the last one you
  // want un-memoised. See docs/patterns/react-compiler.md.
  useEffect(() => {
    drawRef.current = drawFrame
  }, [drawFrame])

  // El mismo indice lo necesitan el canvas y las cotas, asi que se calcula una
  // vez aqui en vez de dos veces con dos redondeos que podrian discrepar: una
  // cota dibujada para el fotograma vecino se despega de la maquina justo en el
  // pico del zoom, que es donde mas se mira.
  const frameIndex = reducedMotion
    ? 0
    : Math.min(frameUrls.length - 1, Math.floor(progress * (frameUrls.length - 1)))

  useEffect(() => {
    wantedIndexRef.current = frameIndex
    drawFrame(frameIndex)
  }, [frameIndex, drawFrame])

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
        <div
          className="ak-machine-hero__sticky"
          style={{ '--ak-hero-progress': progress.toFixed(3) } as React.CSSProperties}
        >
          {!firstFrameReady && (
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

          {/* Las cotas van encima del canvas, no dentro: el canvas se redibuja
              entero en cada fotograma y dibujarlas ahi las convertiria en
              pixeles. En SVG el numero sigue siendo texto. */}
          {anchorsUrl && (
            <DimensionOverlay
              anchorsUrl={anchorsUrl}
              frameIndex={frameIndex}
              progress={progress}
              labels={dimensionLabels ?? {}}
              reducedMotion={reducedMotion}
            />
          )}
        </div>
      </div>
    </div>
  )
}

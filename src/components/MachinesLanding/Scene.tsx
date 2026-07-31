'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useActiveFamily } from './Provider'

const HEADER_OFFSET_PX = 62

/**
 * The pinned opening: the line stays fixed in the viewport while the scroll
 * drives it — the front render crossfades into the three-quarter one and the
 * copy steps through the family's highlights. Falls back to a plain stacked
 * section under `prefers-reduced-motion`.
 */
export const MachinesScene: React.FC = () => {
  const { active } = useActiveFamily()
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      title: active.headline ?? active.tagline ?? active.name,
      description: active.tagline ?? active.description,
    },
    ...active.highlights.map((h) => ({ title: h.title, description: h.description })),
  ].slice(0, 4)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

  const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length))
  const turn = Math.min(1, Math.max(0, (progress - 0.28) / 0.32))

  return (
    <section
      className="ak-scene"
      ref={sectionRef}
    >
      <div
        className="ak-scene__pin"
        ref={pinRef}
        style={
          {
            '--ak-scene-progress': progress.toFixed(3),
            '--ak-scene-turn': turn.toFixed(3),
          } as React.CSSProperties
        }
      >
        <span className="ak-scene__glow" />

        <div className="ak-scene__stage">
          <div className="ak-scene__unit">
            {active.heroUrl && (
              <Image
                src={active.heroUrl}
                alt={active.name}
                fill
                priority
                sizes="(max-width: 720px) 60vw, 340px"
                quality={100}
                className="ak-scene__img ak-scene__img--front"
              />
            )}
            {active.hoverUrl && (
              <Image
                src={active.hoverUrl}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 720px) 60vw, 340px"
                quality={100}
                className="ak-scene__img ak-scene__img--side"
              />
            )}
          </div>
        </div>

        <div className="ak-scene__copy">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`ak-scene__step${index === stepIndex ? ' ak-scene__step--on' : ''}`}
            >
              <p className="ak-scene__eyebrow">{active.name}</p>
              <h2 className="ak-scene__title">{step.title}</h2>
              {step.description && <p className="ak-scene__text">{step.description}</p>}
            </div>
          ))}
        </div>

        <div
          className="ak-scene__progress"
          aria-hidden="true"
        >
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={
                index <= stepIndex ? 'ak-scene__tick ak-scene__tick--on' : 'ak-scene__tick'
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}

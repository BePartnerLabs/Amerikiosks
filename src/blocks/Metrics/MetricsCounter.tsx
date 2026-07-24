'use client'

import { useEffect, useRef, useState } from 'react'

const NUMERIC_PREFIX = /^(\d+)(.*)$/

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export const MetricsCounter: React.FC<{ value: string }> = ({ value }) => {
  const match = value.match(NUMERIC_PREFIX)
  const target = match ? Number.parseInt(match[1], 10) : null
  const suffix = match ? match[2] : ''

  const start = target !== null && target >= 100 ? Math.round(target * 0.6) : 0
  const [display, setDisplay] = useState(start)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === null) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(target)
      setDone(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        observer.disconnect()

        const durationMs = 1200
        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const t = Math.min(elapsed / durationMs, 1)
          const eased = easeOutCubic(t)
          const value = Math.round(start + (target - start) * eased)
          setDisplay(value)

          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            setDone(true)
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, start])

  if (target === null) {
    return <span ref={ref}>{value}</span>
  }

  return <span ref={ref}>{done ? `${target}${suffix}` : `${display}${suffix}`}</span>
}

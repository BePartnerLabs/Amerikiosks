'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Tracks 0->1 scroll progress through a tall wrapper element.
 * 0 = wrapper top just reached viewport top, 1 = wrapper bottom reached viewport bottom.
 */
export function useScrollProgress(wrapperRef: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const handle = () => {
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0)
        return
      }
      const raw = -rect.top / scrollable
      setProgress(Math.min(1, Math.max(0, raw)))
    }

    handle()
    window.addEventListener('scroll', handle, { passive: true })
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle)
      window.removeEventListener('resize', handle)
    }
  }, [wrapperRef])

  return progress
}

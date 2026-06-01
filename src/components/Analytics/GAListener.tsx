'use client'

import { useEffect } from 'react'

export function GAListener() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-ga-event]')
      if (!el) return
      const g = (window as any).gtag
      if (typeof g !== 'function') return
      g('event', el.dataset.gaEvent, {
        section: el.dataset.gaSection ?? undefined,
        label: el.dataset.gaLabel || el.innerText.trim().slice(0, 100) || undefined,
        locale: document.documentElement.lang || undefined,
      })
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return null
}

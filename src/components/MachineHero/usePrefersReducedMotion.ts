'use client'

import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const handle = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', handle)
    return () => query.removeEventListener('change', handle)
  }, [])

  return reduced
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  type A11yPrefs,
  applyA11yPrefs,
  DEFAULT_A11Y_PREFS,
  readStoredA11yPrefs,
  storeA11yPrefs,
} from '@/utilities/a11yPrefs'

export function useA11yPrefs() {
  // Start at defaults so server and first client render agree; the real values
  // arrive in the mount effect below. The <head> restore script has already
  // applied them to <html>, so there is no visual flash — only the panel's own
  // control states settle a tick later.
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_A11Y_PREFS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredA11yPrefs()
    setPrefs(stored)
    applyA11yPrefs(stored, document.documentElement)
    setHydrated(true)
  }, [])

  const setPref = useCallback(<K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value }
      applyA11yPrefs(next, document.documentElement)
      storeA11yPrefs(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = { ...DEFAULT_A11Y_PREFS }
    setPrefs(next)
    applyA11yPrefs(next, document.documentElement)
    storeA11yPrefs(next)
  }, [])

  return { prefs, setPref, reset, hydrated }
}

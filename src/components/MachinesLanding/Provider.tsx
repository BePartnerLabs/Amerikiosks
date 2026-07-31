'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { FamilyView } from './types'

type Ctx = {
  families: FamilyView[]
  active: FamilyView
  select: (slug: string) => void
}

const FamilyContext = createContext<Ctx | null>(null)

export const useActiveFamily = (): Ctx => {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useActiveFamily must be used inside <MachinesLandingProvider>')
  return ctx
}

type Props = {
  families: FamilyView[]
  children: React.ReactNode
}

/**
 * Holds which line is being shown. It wraps the whole landing — including the
 * server-rendered trust strip, which comes through as `children` — so the
 * lineup at the top and the sections below stay in sync without the page
 * having to become a Client Component itself.
 */
export const MachinesLandingProvider: React.FC<Props> = ({ families, children }) => {
  const [activeSlug, setActiveSlug] = useState(families[0]?.slug ?? '')

  const select = useCallback((slug: string) => setActiveSlug(slug), [])

  const value = useMemo<Ctx>(() => {
    const active = families.find((f) => f.slug === activeSlug) ?? families[0]
    return { families, active, select }
  }, [families, activeSlug, select])

  if (!families.length) return null

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

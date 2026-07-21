'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ConsentPreferences } from '@/utilities/consent'
import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  serializeConsentCookie,
} from '@/utilities/consent'
import { ConsentBanner } from './ConsentBanner'
import { ConsentPreferencesButton } from './ConsentPreferencesButton'

type Props = {
  initialConsent: ConsentPreferences | null
}

export function ConsentManager({ initialConsent }: Props) {
  const router = useRouter()
  const [decided, setDecided] = useState(initialConsent !== null)
  const [open, setOpen] = useState(initialConsent === null)
  const [expanded, setExpanded] = useState(false)
  const [analyticsChecked, setAnalyticsChecked] = useState(initialConsent?.analytics ?? true)
  // The very first appearance (no trigger button, just loads with the page)
  // sits bottom-right. Reopening via the floating button feels disconnected
  // if the panel pops up on the opposite side of the screen from the click —
  // once there's a trigger, the panel follows it.
  const [anchor, setAnchor] = useState<'end' | 'start'>('end')

  function persist(analytics: boolean) {
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
      serializeConsentCookie(analytics),
    )}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`
    setAnalyticsChecked(analytics)
    setDecided(true)
    setOpen(false)
    setExpanded(false)
    router.refresh()
  }

  function reopen() {
    setExpanded(true)
    setOpen(true)
    setAnchor('start')
  }

  if (open) {
    return (
      <ConsentBanner
        expanded={expanded}
        analyticsChecked={analyticsChecked}
        anchor={anchor}
        onExpand={() => setExpanded(true)}
        onAnalyticsChange={setAnalyticsChecked}
        onAcceptAll={() => persist(true)}
        onReject={() => persist(false)}
        onSave={() => persist(analyticsChecked)}
      />
    )
  }

  if (decided) {
    return <ConsentPreferencesButton onClick={reopen} />
  }

  return null
}

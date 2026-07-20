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
  }

  if (open) {
    return (
      <ConsentBanner
        expanded={expanded}
        analyticsChecked={analyticsChecked}
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

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
    // A fresh id per decision — every accept/reject/save is its own
    // append-only audit entry in ConsentLog, not an update to a prior one.
    const consentId =
      typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36)

    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported in Safari/Firefox yet — document.cookie is the only cross-browser way to set this
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
      serializeConsentCookie(analytics, consentId),
    )}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`
    setAnalyticsChecked(analytics)
    setDecided(true)
    setOpen(false)
    setExpanded(false)

    // Fire-and-forget: the cookie is the source of truth for the user's
    // browser experience, the server log is only for consent-litigation
    // evidence and shouldn't block the UI on network latency.
    fetch('/next/consent-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentId, analytics }),
    }).catch(() => {})

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

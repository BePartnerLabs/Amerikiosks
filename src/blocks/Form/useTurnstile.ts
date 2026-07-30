'use client'

import { useEffect, useRef, useState } from 'react'

type Turnstile = {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void },
  ) => string
  reset: (widgetId: string) => void
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_ID = 'cf-turnstile-script'

function loadScript(): Promise<void> {
  if (document.getElementById(SCRIPT_ID)) {
    return (window as Window & { turnstile?: Turnstile }).turnstile
      ? Promise.resolve()
      : new Promise((resolve) => {
          document.getElementById(SCRIPT_ID)?.addEventListener('load', () => resolve())
        })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile script failed to load'))
    document.head.appendChild(script)
  })
}

/**
 * Renders a Turnstile widget and hands back its token.
 *
 * The site key is read from the <meta name="turnstile-site-key"> tag that the
 * frontend layout emits when Turnstile is enabled in Settings — with the
 * feature off there is no meta tag, this hook does nothing, and forms submit
 * exactly as before.
 *
 * `active` exists because every modal drawer on a page mounts its own
 * FormBlock into a portal: the home page carries fourteen of them, and
 * rendering a widget per form meant fourteen Cloudflare challenges racing each
 * other on load, each with its own badge. Callers pass true only once their
 * form is actually being used, so exactly one widget ever exists.
 */
export function useTurnstile(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [siteKey, setSiteKey] = useState<string | undefined>(undefined)

  // Read on mount, not on first interaction: knowing Turnstile is configured is
  // what lets the form reserve the widget's space up front. Reading a meta tag
  // costs nothing — the script and the widget itself still wait for `active`.
  useEffect(() => {
    const key = document.querySelector('meta[name="turnstile-site-key"]')?.getAttribute('content')
    if (key) setSiteKey(key)
  }, [])

  useEffect(() => {
    if (!active || !siteKey || !containerRef.current || widgetIdRef.current) return
    let cancelled = false

    loadScript()
      .then(() => {
        const turnstile = (window as Window & { turnstile?: Turnstile }).turnstile
        if (cancelled || !turnstile || !containerRef.current) return
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (t) => setToken(t),
          'expired-callback': () => setToken(undefined),
        })
      })
      .catch((err) => {
        // A blocked or failing Cloudflare script must not make the form
        // unsubmittable; the server treats a missing token as a failed check
        // only while Turnstile is enabled and reachable.
        console.error('[turnstile]', err)
      })

    return () => {
      cancelled = true
    }
  }, [active, siteKey])

  const reset = () => {
    const turnstile = (window as Window & { turnstile?: Turnstile }).turnstile
    if (turnstile && widgetIdRef.current) {
      turnstile.reset(widgetIdRef.current)
      setToken(undefined)
    }
  }

  return { containerRef, token, enabled: Boolean(siteKey), reset }
}

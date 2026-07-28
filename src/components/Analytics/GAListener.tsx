'use client'

import { useEffect } from 'react'

type Gtag = (
  command: 'event',
  eventName: string | undefined,
  params: {
    block?: string
    section?: string
    label?: string
    locale?: string
    machine_id?: string
    form_name?: string
  },
) => void

export function GAListener() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-ga-event]')
      if (!el) return
      const g = (window as Window & { gtag?: Gtag }).gtag
      if (typeof g !== 'function') return
      const blockEl = el.closest<HTMLElement>('[data-ga-block]')
      g('event', el.dataset.gaEvent, {
        block: blockEl?.dataset.gaBlock ?? undefined,
        section: el.dataset.gaSection ?? blockEl?.dataset.gaSection ?? undefined,
        label: el.dataset.gaLabel || el.innerText.trim().slice(0, 100) || undefined,
        locale: document.documentElement.lang || undefined,
        machine_id: el.dataset.gaMachineId ?? undefined,
        form_name: el.dataset.gaFormName ?? undefined,
      })
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return null
}

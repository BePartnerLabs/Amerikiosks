import config from '@payload-config'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Machine } from '@/payload-types'
import { MachinesClient } from './MachinesClient'
import './machines.css'

export const metadata: Metadata = {
  title: 'Machines — Amerikiosks',
  description: 'Browse Amerikiosks kiosk formats — full-size, compact, campaign, and premium.',
}

export default async function MachinesPage() {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'machines',
    depth: 1,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    limit: 200,
  })

  const machines = result.docs as Machine[]

  const allTags = Array.from(
    new Set(machines.flatMap((m) => (m.tags ?? []).map((t) => t.label)).filter(Boolean)),
  ) as string[]

  return (
    <main className="ak-machines-page">
      <div className="bp-content-grid">
        <div className="content ak-machines-page__inner">
          <h1 className="ak-machines-page__heading">Machines</h1>
          <MachinesClient
            machines={machines}
            allTags={allTags}
          />
        </div>
      </div>
    </main>
  )
}

import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { Machine, MachinesListingBlock as MachinesListingBlockProps } from '@/payload-types'
import { MachinesListingClient } from './Component'
import './styles.css'

const formatTagOrder = ['full-size', 'compact', 'campaign', 'premium']

export const MachinesListingServer: React.FC<MachinesListingBlockProps> = async ({
  itemsPerPage,
}) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  // Fetch-all + client-side filter/paginate is a small-catalog choice (machines
  // is a handful of docs). Don't copy this verbatim for higher-cardinality
  // collections (e.g. insights, projects) — use server-side `where`/`page` there.
  const result = await payload.find({
    collection: 'machines',
    depth: 1,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    limit: 200,
  })

  const machines = result.docs as Machine[]

  const presentTags = new Set(
    machines.flatMap((m) => (m.tags ?? []).map((t) => t.label)).filter(Boolean),
  )
  const allTags = formatTagOrder.filter((tag) => presentTags.has(tag))

  return (
    <section
      className="ak-machines-listing"
      aria-label="Machines"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-machines-listing__inner">
          <MachinesListingClient
            machines={machines}
            allTags={allTags}
            itemsPerPage={itemsPerPage ?? 12}
          />
        </div>
      </div>
    </section>
  )
}

/**
 * Prints the `machines` page layout as the Local API sees it, one locale at a
 * time. Read-only — it exists so a write script can be built against the real
 * shape of the document instead of a guess at it.
 *
 *   pnpm payload run scripts/inspect-machines-page.ts
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

for (const locale of ['en', 'es'] as const) {
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    draft: true,
    depth: 0,
    limit: 1,
    where: { slug: { in: ['machines', 'maquinas'] } },
  })

  const page = docs[0]
  if (!page) {
    console.log(`\n### ${locale}: no encontrada`)
    continue
  }

  console.log(`\n### ${locale} — id ${page.id}, slug "${page.slug}", _status ${page._status}`)
  for (const block of page.layout ?? []) {
    console.log(JSON.stringify(block, null, 2))
  }
}

process.exit(0)

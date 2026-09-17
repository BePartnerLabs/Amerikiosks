/**
 * Writes the Spanish locale of the two blocks on the `machines` page.
 *
 * Why it exists: the blocks were created with the selector on `en`, so the
 * `es` locale has no row of its own and Payload falls back to English. The
 * Spanish page publishes "3 models in line", "Coming soon" and "See machine",
 * and nothing in /admin flags it — the fields look filled because the fallback
 * renders.
 *
 *   pnpm payload run scripts/fill-machines-es-locale.ts           # plan only
 *   pnpm payload run scripts/fill-machines-es-locale.ts --apply   # write it
 *
 * Two safeguards, both deliberate:
 *
 * - **Refuses to run against anything but localhost.** Rehearse here, then run
 *   it against production once it is known to work — that is the whole point of
 *   restoring a dump.
 * - **Sends every block with its `id`.** A locale write that omits them wipes
 *   the other language and answers 200 OK. See
 *   docs/patterns/payload-localized-arrays.md.
 *
 * The texts are working copy, rehearsed in local on 2026-08-27 and recorded in
 * docs/post-release-admin.md — not final. The content session rewrites them.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const APPLY = process.argv.includes('--apply')

/** Keyed by block id so a reordered layout still matches the right block. */
const SPANISH: Record<string, Record<string, string>> = {
  // machineFamilyRows — the seven from docs/post-release-admin.md §6.2.
  // `countEyebrowOne` is not redundant: Zeta has exactly one model, and without
  // it that row reads "1 modelos en la línea".
  '6a90ea1b1bf999853c062ca3': {
    eyebrow: 'Nuestras líneas',
    heading: 'Todas las líneas',
    countEyebrow: 'modelos en la línea',
    countEyebrowOne: 'modelo en la línea',
    ctaLabel: 'Ver los modelos',
    soonLabel: 'Próximamente',
    soonCtaLabel: 'Ver la línea',
  },
  // machineModels — no rehearsed values existed for this one; these are new.
  '6a90ea481bf999853c062ca4': {
    eyebrow: 'La gama',
    heading: 'Todos los modelos',
    ctaLabel: 'Ver la máquina',
  },
}

const payload = await getPayload({ config })

const dbUrl = process.env.DATABASE_URI ?? process.env.DATABASE_URL ?? ''
if (APPLY && !/@(localhost|127\.0\.0\.1|postgres)[:/]/.test(dbUrl)) {
  console.error('Se niega a escribir: DATABASE_URI no apunta a localhost.')
  process.exit(1)
}

const { docs } = await payload.find({
  collection: 'pages',
  locale: 'es',
  draft: true,
  depth: 0,
  limit: 1,
  where: { slug: { in: ['machines', 'maquinas'] } },
})

const page = docs[0]
if (!page) {
  console.error('No se encontró la página de máquinas.')
  process.exit(1)
}

// Rebuild the whole array: each block keeps its id and blockType, and only the
// fields named above change. Anything left out of a block here is sent back
// exactly as it came, so no field is dropped by omission.
const layout = (page.layout ?? []).map((block) => {
  const overrides = SPANISH[block.id as string]
  if (!overrides) {
    console.warn(`  sin traducción para el bloque ${block.blockType} (${block.id}) — se deja igual`)
    return block
  }
  return { ...block, ...overrides }
})

console.log(`Página ${page.id} — "${page.slug}", _status ${page._status}`)
for (const block of layout) {
  console.log(`\n  ${block.blockType} (${block.id})`)
  // Los valores salen de SPANISH y no del bloque: después del spread de arriba
  // son el mismo dato, y leerlos del bloque obligaría a castear un union de
  // tipos de bloque a un índice genérico.
  for (const [key, value] of Object.entries(SPANISH[block.id as string] ?? {})) {
    console.log(`    ${key.padEnd(16)} ${JSON.stringify(value)}`)
  }
}

if (!APPLY) {
  console.log('\nEsto es el plan. Volvé a correrlo con --apply para escribirlo.')
  process.exit(0)
}

await payload.update({
  collection: 'pages',
  id: page.id,
  locale: 'es',
  draft: true, // publishing is a separate, deliberate step
  data: { layout },
})

console.log('\nEscrito en el locale es. La página sigue en borrador.')
process.exit(0)

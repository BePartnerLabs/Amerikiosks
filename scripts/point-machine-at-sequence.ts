/**
 * Points a machine at a frame sequence already uploaded to R2 — LOCAL ONLY.
 *
 * The frames live in R2 and R2 is readable from local, so nothing needs to be
 * uploaded or re-dumped to preview a sequence: the machine record just has to
 * say where to look.
 *
 *   pnpm payload run scripts/point-machine-at-sequence.ts kappa-13 kappa-13/v0.02 90
 *   pnpm payload run scripts/point-machine-at-sequence.ts kappa-13 kappa-13/v0.02 90 -- --apply
 *
 * The three fields go in ONE update on purpose: a hook rejects a change to the
 * frame count that leaves the folder the same, so saving them separately fails.
 *
 * Refuses to run against anything but localhost. In production this is done in
 * /admin, where a person can see what they are changing.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const args = process.argv.slice(2).filter((a) => a !== '--apply')
const APPLY = process.argv.includes('--apply')
const [slug, sequencePath, frameCountRaw] = args

if (!slug || !sequencePath || !frameCountRaw) {
  console.error('Uso: <slug> <sequencePath> <frameCount> [-- --apply]')
  process.exit(1)
}

const frameCount = Number(frameCountRaw)
if (!Number.isInteger(frameCount) || frameCount < 1) {
  console.error(`frameCount inválido: ${frameCountRaw}`)
  process.exit(1)
}

const payload = await getPayload({ config })

const dbUrl = process.env.DATABASE_URI ?? process.env.DATABASE_URL ?? ''
if (!/@(localhost|127\.0\.0\.1|postgres)[:/]/.test(dbUrl)) {
  console.error('Se niega a correr: DATABASE_URI no apunta a localhost.')
  process.exit(1)
}

const { docs } = await payload.find({
  collection: 'machines',
  draft: true,
  depth: 0,
  limit: 1,
  where: { slug: { equals: slug } },
})

const machine = docs[0]
if (!machine) {
  console.error(`No existe la máquina "${slug}".`)
  process.exit(1)
}

console.log(`${slug} (id ${machine.id})`)
console.log(`  useRotationHero  ${machine.useRotationHero} → true`)
console.log(`  sequencePath     ${machine.sequencePath ?? '∅'} → ${sequencePath}`)
console.log(`  frameCount       ${machine.frameCount ?? '∅'} → ${frameCount}`)

if (!APPLY) {
  console.log('\nEsto es el plan. Volvé a correrlo con `-- --apply`.')
  process.exit(0)
}

await payload.update({
  collection: 'machines',
  id: machine.id,
  data: { useRotationHero: true, sequencePath, frameCount },
  // Same reason as publish-all-local.ts: the revalidate hook calls Next's
  // revalidatePath, which only works inside a request.
  context: { disableRevalidate: true },
})

console.log('\nListo.')
process.exit(0)

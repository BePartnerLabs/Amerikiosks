/**
 * Publishes every draft document in the content collections — LOCAL ONLY.
 *
 * Why: ten of the twenty-four pages are drafts, so the frontend answers 404 for
 * them and the whole /machines branch cannot be reviewed end to end. Publishing
 * them locally is how you see the site as it would look after launch, without
 * that being a launch decision.
 *
 *   pnpm payload run scripts/publish-all-local.ts              # plan only
 *   pnpm payload run scripts/publish-all-local.ts -- --apply   # write it
 *
 * Note the `--`: pnpm keeps the flag for itself otherwise.
 *
 * This script refuses to run against anything but localhost, and it is not a
 * production tool. What goes live, and when, is a launch decision a person
 * makes in /admin — publishing the audience cluster in particular puts pages in
 * front of visitors that nobody has signed off.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const APPLY = process.argv.includes('--apply')
const COLLECTIONS = ['pages', 'machines', 'machine-families'] as const

const payload = await getPayload({ config })

const dbUrl = process.env.DATABASE_URI ?? process.env.DATABASE_URL ?? ''
if (!/@(localhost|127\.0\.0\.1|postgres)[:/]/.test(dbUrl)) {
  console.error('Se niega a correr: DATABASE_URI no apunta a localhost.')
  console.error('Publicar en producción es una decisión de lanzamiento, y se toma en /admin.')
  process.exit(1)
}

let total = 0

for (const collection of COLLECTIONS) {
  const { docs } = await payload.find({
    collection,
    draft: true,
    depth: 0,
    limit: 500,
    where: { _status: { not_equals: 'published' } },
  })

  if (docs.length === 0) {
    console.log(`\n${collection}: nada en borrador`)
    continue
  }

  console.log(`\n${collection}: ${docs.length} en borrador`)
  for (const doc of docs) {
    const label = (doc as { slug?: string; title?: string }).slug ?? doc.id
    console.log(`  ${APPLY ? 'publicando' : 'publicaría'}  ${label}`)
    if (!APPLY) continue

    // Publishing is locale-agnostic: `_status` is not a localized field, so one
    // update covers both languages and neither locale's content is touched.
    await payload.update({
      collection,
      id: doc.id,
      data: { _status: 'published' },
      // `revalidatePage` calls Next's `revalidatePath`, which only works inside
      // a request. From a script it throws "static generation store missing"
      // and takes the whole transaction down with it. The hook already offers
      // this escape hatch; nothing needs revalidating here because `next dev`
      // does not serve the full route cache anyway.
      context: { disableRevalidate: true },
    })
    total++
  }
}

console.log(
  APPLY
    ? `\n${total} documentos publicados en local.`
    : '\nEsto es el plan. Volvé a correrlo con `-- --apply` para escribirlo.',
)

process.exit(0)

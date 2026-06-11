---
name: seed-data
description: Use when writing or updating seed functions for this project — covers the full pattern for seeding media assets, collection records, and pages via the admin seed panel infrastructure.
---

# Seed Data

Comprehensive guide to writing idempotent seed functions for Amerikiosks.

## Infrastructure

| File | Purpose |
|---|---|
| `src/app/(frontend)/next/seed/run/route.ts` | POST endpoint — dispatches by `?part=` param |
| `src/endpoints/seed/pages/utils.ts` | `upsertPage()` — EN create/update then ES locale update |
| `src/endpoints/seed/uploadMedia.ts` | Upload image from `public/seed-assets/`, idempotent |
| `src/components/SeedPanel/index.tsx` | Admin dashboard buttons — add entry here to expose a seed |
| `public/seed-assets/` | All seed images live here |

## Adding a new seed part

1. Create `src/endpoints/seed/pages/<name>.ts` (or `src/endpoints/seed/<name>.ts` for globals/collections)
2. Export an async function `seed<Name>(payload, req)`
3. Register it in `route.ts` → `parts` record: `'my-part': seedMyPart`
4. Add it to `SeedPanel/index.tsx` → `PARTS` array: `{ key: 'my-part', label: 'My Part' }`

## Media assets

Seed images must be placed in `public/seed-assets/` and named with lowercase kebab slugs (e.g. `machine-full-size.jpg`, `hero-for-brands.png`).

```ts
import { uploadMedia } from '../uploadMedia'

const image = await uploadMedia(
  payload,
  req,
  path.join(process.cwd(), 'public', 'seed-assets', 'my-image.jpg'),
  'Alt text for the image',
)
// image.id is the Payload media record ID — pass to hero.media, items[].image, etc.
```

`uploadMedia` is idempotent: if a file with the same filename already exists in the DB it skips re-upload. The seed route also deletes known seed blobs from Vercel Blob before running, keyed by filename stems registered in `seedStems[]` in `route.ts` — add new stems there so re-seeding after a DB reset doesn't hit "blob already exists" errors.

## Seeding collection records

Always check for existing records by a stable unique field (slug, question text, etc.) and update if found, create if not. For bilingual collections, update EN locale first then ES locale separately.

```ts
const existing = await payload.find({
  collection: 'machines',
  where: { slug: { equals: m.slug } },
  limit: 1,
  req,
})

let id: number
if (existing.totalDocs > 0) {
  const updated = await payload.update({
    collection: 'machines',
    id: existing.docs[0]!.id,
    locale: 'en',
    data: { name: m.name, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }] },
    req: { ...req, locale: 'en' } as PayloadRequest,
  })
  id = updated.id as number
} else {
  const created = await payload.create({
    collection: 'machines',
    locale: 'en',
    data: { name: m.name, slug: m.slug, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }], layout: [], _status: 'published' },
    req: { ...req, locale: 'en' } as PayloadRequest,
  })
  id = created.id as number
}

// ES locale update
await payload.update({
  collection: 'machines',
  id,
  locale: 'es',
  data: { name: m.nameEs, tagline: m.taglineEs },
  req: { ...req, locale: 'es' } as PayloadRequest,
})
```

## Seeding pages

Use `upsertPage(payload, req, en, es)` from `src/endpoints/seed/pages/utils.ts`. It:
1. Finds existing page by slug
2. Creates or updates EN locale
3. Re-fetches with `depth:0` to get raw block IDs
4. Updates ES locale, syncing array row IDs automatically

```ts
await upsertPage(payload, req,
  { title: 'My Page', slug: 'my-page', hero: { ... }, layout: [ ... ], _status: 'published', meta: { ... } },
  { title: 'Mi Página', slug: 'my-page', hero: { ... }, layout: [], meta: { ... } },
)
```

**Always pass `hero` in the ES object if the EN hero has `links`.** Payload validates required fields (url, label) for every locale on update — omitting hero from ES causes ValidationError.

## Deleting stubs before upsertPage

`seedAudiencePages` pre-creates audience pages (for-brands, for-venues, for-agencies) as stubs with `lowImpact` hero and no links. If your seed wants a different hero type, delete the stub first:

```ts
const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'for-brands' } },
  limit: 1,
  req,
})
if (existing.totalDocs > 0) {
  await payload.delete({ collection: 'pages', id: existing.docs[0]!.id, overrideAccess: true, req })
}
// now upsertPage creates fresh with the correct hero type
```

**Rule:** if the target page exists with a different `hero.type` or has `links: []` when your seed sets links, delete it first.

## ES locale for hero links

`upsertPage` syncs EN link row IDs into the ES update automatically — but you must provide the ES hero with translated values:

```ts
// ES hero with translated link labels (urls are typically the same)
hero: {
  type: 'mediumImpact',
  media: heroImage.id,
  richText: { /* ES richText */ },
  links: [
    { link: { label: 'Texto traducido', type: 'custom', url: '/contact', appearance: 'default' } },
    { link: { label: 'Otro texto', type: 'custom', url: '/insights', appearance: 'outline' } },
  ],
},
```

## richText helper

For inline rich text in seed data:

```ts
const richText = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text }],
      },
    ],
  },
})
```

`direction: null`, `format: '' as const`, and `indent: 0` are required — omitting them causes TypeScript errors.

## Migrations

After adding new collections or blocks, always:
1. `pnpm payload migrate:create` — generates migration file in `src/migrations/`
2. `pnpm payload migrate` — applies it to the DB
3. Commit the generated migration file

## seedAudiencePages — skip-if-exists pattern

`seedAudiencePages` creates stub pages that are later overwritten by dedicated seed functions (e.g. `seedForBrands`). On re-seed, those pages already exist with richer heroes. The pattern to handle this:

1. **Always upload media first** (idempotent) — this populates `mediaIds` which `seedHome` needs for the audience showcase items
2. **Then check if the page exists** — if yes, collect its ID and `continue` without calling `upsertPage`
3. **Only call `upsertPage`** for pages that don't exist yet

```ts
// Always upload media (idempotent) so mediaIds is always populated
const heroImage = await uploadMedia(payload, req, path.join(...), alt)
mediaIds[page.slug] = heroImage.id as number

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: page.slug } },
  limit: 1,
  depth: 0,
  req,
})

if (existing.totalDocs > 0) {
  pageIds[page.slug] = String(existing.docs[0]!.id)
  payload.logger.info(`  Audience page exists, skipping stub: ${page.slug}`)
  continue
}

// only runs for new pages
const result = await upsertPage(payload, req, enData, esData)
pageIds[page.slug] = String(result.id)
```

**Do NOT try to extract `mediaIds` from `doc.hero.media`** — the hero type is a discriminated union and `media` is only present on some variants. Always re-upload instead.

## layout is NOT localized — never pass `layout: []` in the ES update

The `layout` field on the `pages` collection is **not localized**. It is shared across all locales. If you pass `layout: []` in the ES locale update, you wipe the EN layout for every locale.

`upsertPage` handles this correctly: it strips `layout` from the ES data object and only passes it when ES blocks explicitly provide localized field values (`esLayout.length > 0`). Never override this behavior.

**Never do this in an ES seed object:**
```ts
// ❌ wipes the layout for ALL locales
{ title: 'Para Marcas', slug: 'for-brands', layout: [], meta: { ... } }
```

**What `upsertPage` does instead:**
- Destructures `layout` out of the ES data before spreading
- Only passes `layout` to the ES update when ES blocks carry localized field values
- If no ES blocks are provided, layout is omitted from the ES update entirely

**What ES seed objects should look like for pages with no ES block translations:**
```ts
{
  title: 'Para Marcas',
  slug: 'for-brands',
  hero: { /* ES hero with links */ },
  // no layout key — upsertPage strips it safely
  meta: { title: '...', description: '...', image: heroImage.id },
}
```

## Add new seeds to `seedPages`

Every audience page seed (for-brands, for-venues, for-agencies, for-emerging-brands) must be wired into `src/endpoints/seed/pages/index.ts` so "Seed all" produces a fully-seeded page, not just the stub from `seedAudiencePages`.

Call the seed **after** `seedAudiencePages` (so stubs exist to be deleted) and **before** `seedHome` (so `pageIds`/`mediaIds` reflect the upgraded pages):

```ts
const { pageIds, mediaIds } = await seedAudiencePages(payload, req)
await seedForBrands(payload, req)   // deletes stub, creates full page
await seedHome(payload, req, pageIds, postIds, mediaIds)
```

## Common mistakes

| Mistake | Fix |
|---|---|
| Missing `direction`/`format`/`indent` on richText root | All three required — see richText helper above |
| Updating a page whose hero type differs from stub | Delete stub first, then upsertPage creates fresh |
| Omitting hero from ES when EN hero has links | Payload validates link url+label for every locale — always pass ES hero with explicit `links: []` or translated links |
| ES stub with no hero when EN hero has any link rows | Even `lowImpact` stubs — always pass `hero: { type: 'lowImpact', links: [] }` in ES so Payload sees zero link rows to validate |
| Passing `layout: []` in ES seed data | layout is not localized — omit it; upsertPage strips it automatically |
| Forgetting to wire seed into `seedPages` index | "Seed all" creates only the stub; full page never gets seeded |
| Forgetting to add blob filename stem to `seedStems` in route.ts | Blob "already exists" error on re-seed after DB reset |
| Forgetting to add seed part to `SeedPanel/index.tsx` | Button won't appear in admin dashboard |
| Using `String()` for FK IDs | Always `Number()` — Postgres integer FKs reject strings |

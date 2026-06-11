---
name: seed-translations
description: Use when writing or updating ES locale seed data for Payload CMS pages in this project — covers localized block fields, localized array item fields (cta, label), and the upsertPage ID-sync pattern.
---

# Seed Translations

Generates correct bilingual seed data for Payload pages using `upsertPage`.

## Key Rules

- `upsertPage(payload, req, en, es)` handles both locales — EN first, then ES
- For blocks with `localized: true` **top-level fields** (eyebrow, heading, subheading): spread EN block and override
- For blocks with **localized fields inside array items** (e.g. `cta`, `label`): define ES items **explicitly** — do NOT rely on spread
- `upsertPage` re-fetches EN doc with `depth:0` and injects EN row UUIDs into ES `items` and `links` automatically — no manual ID tracking needed

## Pattern

```ts
// ✅ Block-level localized fields only → spread is fine
const myBlockEs = {
  ...myBlock,
  heading: 'Translated heading',
  subheading: 'Translated subheading',
}

// ✅ Block has localized fields INSIDE items → explicit ES items required
const audienceShowcaseBlockEs = {
  ...audienceShowcaseBlock,           // carries non-localized fields (blockType, blockName, image, page)
  eyebrow: 'PARA QUIÉN',
  heading: 'Una plataforma...',
  subheading: '...',
  items: [                            // explicit — cta is localized
    { page: Number(pageIds['for-brands']),  image: mediaIds['for-brands'],  cta: 'Explorar programas de marca' },
    { page: Number(pageIds['for-venues']),  image: mediaIds['for-venues'],  cta: 'Explorar ingresos por venue' },
    { page: Number(pageIds['for-agencies']),image: mediaIds['for-agencies'],cta: 'Explorar activaciones' },
    { page: Number(pageIds['for-emerging-brands']), image: mediaIds['for-emerging-brands'], cta: 'Explorar rutas de lanzamiento' },
  ],
}
```

## Which fields need explicit ES items?

Check the block's `config.ts`. If any field inside the `items` array has `localized: true`, you need explicit ES items.

```ts
// config.ts — these trigger explicit ES items
{ name: 'cta',   type: 'text', localized: true }
{ name: 'label', type: 'text', localized: true }
```

Fields without `localized: true` (e.g. `page`, `image`) are shared across locales — pass the same IDs in both EN and ES items.

## Seed file structure

```
src/endpoints/seed/pages/
  home.ts           # calls upsertPage(payload, req, enPage, esPage)
  audience.ts       # returns { pageIds, mediaIds } consumed by home.ts
  solutions.ts
  where-it-works.ts
  case-studies.ts
  why-amerikiosks.ts
  contact.ts
  for-brands.ts     # seeds Machines + FAQItems + page (hero with links, formatsGrid, processSteps, faqWithForm)
  utils.ts          # upsertPage — handles EN save → re-fetch → ES save with item IDs
src/endpoints/seed/
  header.ts         # seeds Header global
  footer.ts         # seeds Footer global
  insights.ts       # seeds Posts
  partners.ts       # seeds Partners
  uploadMedia.ts    # reads from public/seed-assets/, upserts by filename stem
```

## Seeding Machines and collection records

When a page depends on records in another collection (e.g. Machines, FAQItems), seed those first, then build the page layout referencing their IDs or rely on tag-based queries at render time.

```ts
// for each machine: uploadMedia → payload.find (by slug) → payload.update or payload.create
// update EN locale, then update ES locale separately
const machineId = created.id as number
await payload.update({
  collection: 'machines',
  id: machineId,
  locale: 'es',
  data: { name: m.nameEs, tagline: m.taglineEs },
  req: { ...req, locale: 'es' } as PayloadRequest,
})
```

Machine images live in `public/seed-assets/` (e.g. `machine-full-size.jpg`) and are uploaded via `uploadMedia()`.

## Deleting stub pages before upsertPage

Some pages are pre-created as stubs by `seedAudiencePages` (with `lowImpact` hero and no links). If `seedForBrands` (or similar) wants to create the page with a different hero type, delete the stub first to avoid ValidationError on hero link fields:

```ts
const existingPage = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'for-brands' } },
  limit: 1,
  req,
})
if (existingPage.totalDocs > 0) {
  await payload.delete({
    collection: 'pages',
    id: existingPage.docs[0]!.id,
    overrideAccess: true,
    req,
  })
}
// now upsertPage will create fresh
```

**When this is needed:** any time the target page exists with a different `hero.type` than what the seed wants to set, or when the stub has `links: []` but the seed sets links (Payload validates required fields on update even for the existing locale).

## Delegating to an agent

When asking an agent to write translations for a seed file, provide:

1. The EN block definition (copy from the seed file)
2. The translated strings (or ask the agent to translate)
3. Which fields inside items are `localized: true` (from `config.ts`)
4. The slug keys used in `pageIds` / `mediaIds` (so the agent uses the right keys)

Example prompt:
> "Using the seed-translations skill, write the ES version of `audienceShowcaseBlock` in `home.ts`. The EN block is [paste block]. Fields `cta` and `label` are localized. Page slugs are for-brands, for-venues, for-agencies, for-emerging-brands."

## Blocks with `items` arrays (localized fields inside items)

`upsertPage` now carries EN item row IDs into the ES items, so Payload updates existing rows in-place (writing ES locale `cta`, `label`, `description`, etc.) rather than creating duplicates. Define ES items explicitly with translated values — IDs are injected automatically.

## Blocks with `links` arrays (e.g. CTA block)

The CTA block uses `linkGroup()` which creates a `links: array` field. Inside each link row, `url` and `label` are `localized: true`.

`upsertPage` handles this automatically: it carries EN link row IDs into the ES links array so Payload updates existing rows in-place (writing ES locale values) rather than deleting+recreating them (which would wipe EN locale values).

**What this means for you:** define ES `links` explicitly with translated `label` (and `url` if it differs by locale):

```ts
const ctaBlockEs = {
  ...ctaBlock,
  richText: { /* ES richText */ },
  links: [
    {
      link: {
        type: 'custom' as const,
        appearance: 'default' as const,
        label: 'Comenzar una alianza',  // localized — must be explicit
        url: '/contact',               // localized — same URL is fine
      },
    },
  ],
}
```

Do NOT omit `links` from an ES block that has them — Payload will fail required-field validation on the existing EN link rows.

## Hero `links` array — same ID injection rule applies

The hero `links` field (from `linkGroup()`) has the same Drizzle DELETE+INSERT problem as layout block links. If the ES hero passes new link objects without the EN row IDs, Payload deletes the EN rows and inserts new ones — leaving the EN locale with empty `label` and `url`.

`upsertPage` handles this automatically for hero links too: it re-fetches `rawDoc.hero.links` after the EN save, then injects the EN row IDs into the ES hero links before the ES update.

**What this means for you:** always pass the ES hero with translated links — `upsertPage` stamps the IDs:

```ts
// ES hero — provide translated label/url, upsertPage injects EN row IDs
hero: {
  type: 'mediumImpact',
  media: heroImage.id,
  richText: { /* ES richText */ },
  links: [
    { link: { label: 'Iniciar un programa de marca', type: 'custom', url: '/contact', appearance: 'default' } },
    { link: { label: 'Ver casos de éxito',           type: 'custom', url: '/insights', appearance: 'outline' } },
  ],
},
```

**Never omit hero links in ES when EN hero has links** — Payload validates required fields (`url`, `label`) for every locale on update, and if you pass `links: []` or omit `links`, the EN link rows lose their localized values.

## Common mistakes

| Mistake | Fix |
|---|---|
| Spreading items when `cta`/`label` are localized | Define ES items array explicitly |
| Passing page as `String()` instead of `Number()` | Always `Number(pageIds['slug'])` for Postgres integer FK |
| Omitting `image` from ES items | `image` is not localized but must be present in ES items too |
| Translating slugs in ES items | Slugs are not localized in this project — use the same EN slug key |
| Omitting `links` from ES CTA block | Always include ES `links` — `upsertPage` syncs the row IDs automatically |
| Omitting `hero` from ES when EN hero has links | Payload validates hero link `url`+`label` for every locale on update — always pass ES hero with translated links |
| Hero buttons empty in EN after seeding | ES hero links were passed without EN row IDs — Drizzle deleted EN rows. `upsertPage` now injects IDs automatically; always pass ES hero links so it has something to merge |
| Updating a page whose hero type differs from stub | Delete the stub first (see "Deleting stub pages" section), then upsertPage creates fresh |

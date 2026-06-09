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
  home.ts          # calls upsertPage(payload, req, enPage, esPage)
  audience.ts      # returns { pageIds, mediaIds } consumed by home.ts
  utils.ts         # upsertPage — handles EN save → re-fetch → ES save with item IDs
```

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

## Common mistakes

| Mistake | Fix |
|---|---|
| Spreading items when `cta`/`label` are localized | Define ES items array explicitly |
| Passing page as `String()` instead of `Number()` | Always `Number(pageIds['slug'])` for Postgres integer FK |
| Omitting `image` from ES items | `image` is not localized but must be present in ES items too |
| Translating slugs in ES items | Slugs are not localized in this project — use the same EN slug key |
| Omitting `links` from ES CTA block | Always include ES `links` — `upsertPage` syncs the row IDs automatically |

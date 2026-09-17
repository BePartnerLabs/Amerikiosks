---
title: Seeding Payload data
read_when: Writing a one-off script that creates or updates Payload documents, or deciding whether a data write belongs in a migration.
enforced_by: nothing — runtime behaviour, learned from a seed system that no longer exists
---

# Seeding Payload data

There is **no seed infrastructure in this project**. The system that populated
the initial marketing content was deleted on 2026-07-24 — the site is in
production and content is managed through `/admin` and Payload's import/export
plugin.

What remains is `src/endpoints/seed/home-static.ts`, which is not a seed but a
**production fallback**: `src/app/(frontend)/[locale]/[slug]/page.tsx` uses it
when no `home` page exists in the database, so the site is never blank.

This file keeps the lessons, because the next person writing a one-off data
script will hit the same five walls.

## Shape of a one-off script

1. A temporary endpoint (a Payload `endpoint`, or a route under
   `src/app/(frontend)/next/`) calling a `seed<Name>(payload, req)` function.
2. **Find-then-create-or-update** keyed on a stable unique field (slug, label) so
   a re-run is idempotent. Never blind-create.
3. Media via `payload.create({ collection: 'media', ... })`, idempotent by
   filename where possible.
4. **Delete it once used.** Seed code that outlives its run becomes code nobody
   dares remove and nobody can run.

## The five that cost real time

- **`layout` is not localized.** Passing `layout: []` while updating a
  non-default locale wipes the layout for *every* locale.
- **A richText root needs explicit `direction`, `format` and `indent`.** Omit
  them and TypeScript rejects the object.
- **Foreign keys are `Number()`, never `String()`.** Postgres refuses a string
  in an integer column.
- **Arrays whose subfields are `localized: true` have no separate `_locales`
  table.** Injecting the EN row's `id` while updating ES collides with
  `ValidationError: Value must be unique`. Only pass `id` back when the array
  itself is not localized — which is the opposite of the rule for
  [localized arrays](./payload-localized-arrays.md), so read both before writing
  either.
- **`revalidatePage` must account for the locale** when building the path
  (`/es/...` under `localePrefix: 'as-needed'`), or ISR invalidates the wrong URL
  in production.

## Seeding in a migration vs. seeding through `/admin`

The project rule is that content does not go through a migration. That rule is
too coarse to decide by, and reading it literally leaves a required field empty
in production. The line that actually holds:

- **Creating or authoring content goes through `/admin`.** A new family, a new
  page, editorial copy. Someone decides what it says.
- **Putting rows that already exist back in step with a constraint the migration
  itself just introduced is part of the schema change, not content.** Nobody
  decides anything; the values follow from the change.

Two migrations in this repo already do the second thing:
[`20260730_012000_backfill_text_field_value_type.ts`](../../src/migrations/20260730_012000_backfill_text_field_value_type.ts)
reclassifies existing rows against a field that was added with a default, and
[`20260728_050000_brands_backfill_versions.ts`](../../src/migrations/20260728_050000_brands_backfill_versions.ts)
fills version rows a schema change left empty.

### Why "just mark it required" is not enough

**`required: true` is Payload validation, not a database constraint.** The column
is created nullable, so the migration does not fail on existing rows and nothing
looks broken. What breaks is the panel: an editor who opens *any* document of
that collection cannot save **anything** — not a typo fix, not an image — until
they pick a value for a field nobody told them was now theirs to pick. It reads
as "the admin is broken", not as "a field is missing".

**A `defaultValue` does not backfill.** It applies when a document is created,
never to rows that already exist. (A `number` field is the exception worth
knowing: it emits a real `DEFAULT` on the column, so existing rows do get it.)

**And the generated types stop being true.** A required field comes out of
`generate:types` without `| null`. Leave the column empty in production and
`payload-types.ts` is asserting something the database contradicts, so the
frontend breaks on an `undefined` TypeScript promised was impossible. That is
what turns "should backfill" into "must backfill".

### What a backfill has to touch

- **Both tables, when the collection has `drafts: true`.** The frontend reads the
  main table; `/admin` reads the `latest = true` row of `_<collection>_v` through
  `queryDrafts`. Backfill only the main table and the editor still sees an empty
  required field and still cannot save — which is exactly the incident
  `20260728_050000_brands_backfill_versions.ts` was written for. Historical
  version rows are history; leave them.
- **Key on `slug`, never on `id`.** Ids differ between environments.
- **Guard on `IS NULL`** so a re-run is a no-op and a value someone already fixed
  by hand is never overwritten.
- **A non-destructive `down`.** Undoing a backfill would discard later editorial
  corrections along with it.

### It can only seed what existed when it was written

A backfill covers the rows in the database at the time the migration was
authored. Anything created between then and the deploy — including anything
added after the production dump the migration was tested against — comes out
empty. The backfill is necessary and not sufficient: pair it with a line in
[`docs/post-release-admin.md`](../post-release-admin.md) to check the collection
after the deploy.

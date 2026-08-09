---
title: Seeding Payload data
read_when: Writing a one-off script that creates or updates Payload documents.
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

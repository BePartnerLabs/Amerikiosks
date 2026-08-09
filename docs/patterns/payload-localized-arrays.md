---
title: Payload localized arrays
read_when: Writing to an array field with localized subfields, especially via REST.
enforced_by: nothing — runtime shape, not syntax
---

# Payload: array fields with localized subfields

**Writing to an array field whose subfields are `localized: true`, without
sending each existing item's `id`, silently wipes that field in every other
locale.**

Payload recreates the rows instead of updating them in place, which orphans the
sibling locale's data. The request returns `200 OK`. Nothing looks wrong until
someone opens the other language.

## Where this applies

Any array with localized subfields. Today that includes:

- `machines.specs`
- `machine-families.highlights.items`
- `capabilities.items`

New arrays get added over time — the rule is about the shape, not the list.

## The rule

**Fetch the current document first, and send back the existing `id` for every
array item you touch, in every locale-scoped write.**

```ts
// ✗ Recreates the rows. The ES content of `specs` disappears.
PATCH /api/machines/42?locale=en
{ "specs": [{ "label": "Height", "value": "78\"" }] }

// ✓ Updates in place. Both locales survive.
PATCH /api/machines/42?locale=en
{ "specs": [{ "id": "6a6b...", "label": "Height", "value": "78\"" }] }
```

The same applies to the Local API and to anything scripted against the admin.

## Where it bit

An entire batch of machines during the `feat/machine-pages-v2` rollout. Write-up
in `docs/machines-data-population.md`.

## Adding a new localized array

Two things to decide deliberately:

- **Does the subfield actually need translating?** A checkbox like
  `highlights.items[].featured` should *not* be localized — flagging one item in
  English and a different one in Spanish is not a use case, and every
  non-localized subfield is one less way to trip this.
- **Who writes to it?** If only `/admin` does, the risk is low: the admin UI
  sends the ids. The danger is scripts and migrations.

## Not automatable

There is no lint rule for this — it is a runtime shape, not a syntax. The only
guard is knowing about it, which is why it is written down twice: here and in
the root `CLAUDE.md` gotchas.

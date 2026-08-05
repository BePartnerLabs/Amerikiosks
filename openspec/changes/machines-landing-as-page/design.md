# `/machines` as a normal page — design

> Turns the hard-coded machines landing into a `pages` document composed of
> blocks, so the client owns its copy, its SEO and its section order. The
> visitor-facing line selector goes away: every family is shown, stacked, each
> linking to its own page.

## Context

`/machines` is a hard-coded route (`[locale]/machines/page.tsx`). It queries
`machine-families`, `machines` and — through `TrustStripServer` — `partners`,
then renders four things: a stage, a trust strip, a features section and a
models section.

Three of those already lean on the block system. `TrustStripServer` is rendered
straight from the route, and `machinesListing` and `modelLines` are registered
in `Pages` today, with `modelLines` reused by `RelatedMachines` on the machine
detail page. So this is not introducing the pattern — it is finishing it.

What the route holds that a page does not:

- **Derived data.** The landing sizes the lineup to scale: it reads every
  machine, groups by family, and computes the tallest and widest per line from
  free-text `dimensions` (`'78.42"'`, `'92 in'`). It also counts models per
  line. None of that is authorable — an editor cannot keep it in sync with the
  machines collection, and should not have to.
- **Shared interactive state.** `MachinesStage`, `MachinesFeatures` and
  `MachinesModels` sit inside `MachinesLandingProvider` and react to the
  *selected line*. **This change deletes that state** — see "The selector is
  the bug" below.
- **`CollectionPage` JSON-LD**, built from the families.

## Why bother

Two reasons, and the second one arrived later than the first.

**SEO ownership.** Today the page's `title` and `description` come from
`getTranslations('machines')` — they live in message files, in the repo. The
client cannot edit the meta description of one of the most important pages on
the site without a developer and a deploy. As a `pages` document it inherits
the `plugin-seo` fields like every other page. That is also the pending work
item about documents with no `meta.title`: this page cannot be fixed there
while it is a route.

**Everything should be editable.** The client likes the design and cannot tell
which parts he is allowed to touch. Most of the page already reads from
`machine-families`; the gaps are the section labels, the CTA and the page
meta — all hard-coded. Closing those gaps is most of the perceived problem.

## The selector is the bug

Clicking a family in `MachinesLanding/Lineup.tsx:64` calls
`select(family.slug)` — React state in `Provider.tsx`, same URL, no history
entry. It *feels* like navigation and is not, so the back button does nothing
and the family cannot be linked or shared.

It also hides five families out of six, and it duplicates
`/machines/[family]`: the landing shows name, tagline, description, up to four
highlights and a model grid; the family page shows all of that plus
`SpecsCompare` and `InstallationsGallery`. Two URLs, overlapping content, and
the richer one is nearly unreachable — the landing emits a link to the
*active* family only (`Features.tsx:114`), so five of the six family URLs never
appear in the HTML at all.

**The fix is to stop hiding.** Every family gets a stacked section on the
landing showing its general characteristics and a link to its page. The
landing becomes an index; the family page keeps the depth. The six URLs become
real `<a>` links, which is what the orphan-page problem actually needed.

## The change

**Orderable blocks, not one monolith.** An earlier draft of this design argued
for a single `machinesLanding` block on the grounds that splitting it would
break the shared selected-line state. That argument dies with the selector: once
nothing is shared, the sections are genuinely independent and can be separate,
reorderable blocks — which is the editability the client asked for.

The layout becomes:

```
Hero  →  machineLineup  →  TrustStrip  →  6 × machineFamily  →  CallToAction
```

- **Hero** — the `eyebrow` and `<h1>` currently welded into `Stage.tsx:20-21`
  move out to a standard hero. This is where the copy stops living in message
  files.
- **`machineLineup`** — the big pinned render (`Scene.tsx`) plus the headline
  characteristics. No eyebrow, no title, no selector: it walks the families as
  a panorama and filters nothing below it.
- **`TrustStrip`** — already a registered block; it stops being rendered
  straight from the route and becomes a movable block like any other.
- **`machineFamily`** — new block with a relationship field to
  `machine-families`. The editor adds one per family and picks which family it
  loads; the block reads name, tagline, description and `highlights` from the
  collection, and links to `/machines/[family]`. Content is not retyped, so it
  cannot drift from the collection.
- **`CallToAction`** — existing block.

**The editor picks the family, not the visitor.** A block with visitor-facing
tabs would be the deleted `Provider` in new packaging: still hiding five of six,
still not changing the URL, still feeling like navigation that isn't.

**Consequence to accept: new families are not automatic.** Today the landing
lists whatever is in the collection. With one block per family, adding a family
in `/admin` means also adding its block to the page. That is the price of
ordering and interleaving, and with six slow-moving families it is the right
trade — but it must be in the client manual, or a family will be added and
silently not appear.

## Also in scope

- **Machines enter the sitemap.** `(sitemaps)/` generates only
  `pages-sitemap.xml` and `insights-sitemap.xml`, and `next-sitemap.config.cjs`
  excludes `/*`. Neither `/machines`, nor `/machines/[family]`, nor the model
  pages are in any sitemap today. Restructuring the links without fixing this
  leaves the SEO half-done.
- **The family page's hard-coded copy becomes editable.** `"Models"` and
  `"Explore the ${family.name} line."` are English string literals in
  `[family]/page.tsx` despite the locale param, and the closing CTA is inline
  Lexical JSON (~50 lines). The family fields `ctaLabel` and
  `highlights.items[].icon` already exist and are ignored — wire them up.

## What must not regress

- **The stage background stays dark.** Documented at `Stage.tsx:12-13`: the
  cut-out renders are white machines, and they disappear on a light background.
  A reorderable `machineLineup` block must carry its own dark surface rather
  than inherit the page's, or reordering breaks it visually.
- **`/maquinas` keeps working.** Existing links, and anything the client has
  shared, point at it. The slug must be `maquinas` in ES from day one; a
  redirect row is the fallback, not the plan.
- **The route stays server-rendered.** `pages` routes are already `ƒ`. Do not
  reach for `generateStaticParams` here — it is what took `/machines/[family]`
  down in production once.
- **`GATED_PATHS=/machines` keeps gating it.** The check is path-based
  (`utilities/gatedPaths.ts`), so it is indifferent to how the path resolves —
  worth asserting in a test rather than assuming.
- **The derived numbers stay derived.** If the lineup scale or the model count
  becomes an authorable field during this refactor, the change has failed: it
  will silently disagree with the machines collection within a month. They stay
  computed in the block's `Server.tsx`.
- **`modelLines` keeps working on the detail page**, where `RelatedMachines`
  renders it directly.

## The cost, and it is the part to decide

**The URL stops being resolved the same way as its children.**

Today all three machines paths are localized by next-intl `pathnames` in
`src/i18n/routing.ts`:

```ts
'/machines': { en: '/machines', es: '/maquinas' },
'/machines/[family]': { en: '/machines/[family]', es: '/maquinas/[family]' },
'/machines/[family]/[slug]': { … },
```

As a page, `/machines` would be localized by its **slug** instead (`machines` /
`maquinas`), which `pages` already supports and `PagesRepository.translateSlug`
already exercises. But `/machines/[family]` and `/machines/[family]/[slug]`
stay hard-coded routes with real logic, so they keep their `pathnames` entries.

The result: the parent resolves by slug, the children by `pathnames`. Both work
— Next matches the static route segments before the `pages` catch-all — but the
same URL hierarchy would be governed by two mechanisms. Whoever renames
`/maquinas` in a year has to know to change it in two places, and changing only
one produces a parent and children on different paths.

Three ways to live with that, in order of preference:

1. **Accept the split, and write it into `src/app/(frontend)/CLAUDE.md`.**
   Cheapest, and that file already exists to answer exactly this kind of
   question. The risk is documentation drift.
2. **Keep the `'/machines'` entry in `pathnames` anyway**, pointing at the page
   slug, so both mechanisms agree by construction. Needs verification that
   next-intl does not then rewrite the request out from under the page route.
3. **Move the children into pages too.** Consistent, and much larger — the
   detail pages carry real query logic and their own JSON-LD. Not this change.

## Migration

The page has to exist before the route is deleted, and it carries content, so
this is content plus code:

1. Ship the `machineLineup` and `machineFamily` blocks, registered in `Pages`,
   with the route still in place. Nothing changes for visitors.
2. Create the `pages` document (slug `machines` / `maquinas`) with the block
   layout, in both locales, and fill the SEO fields. Verify it at a preview URL
   — the route still wins for `/machines` at this point.
3. Delete `[locale]/machines/page.tsx`, the `MachinesLandingProvider` and the
   `'/machines'` entry from `pathnames`. Now the page serves the URL.
4. Add the machines sitemap and wire the family page's hard-coded copy to
   fields.
5. Verify `/machines`, `/es/maquinas`, `/maquinas` → redirect, and that the two
   child routes still resolve.

Step 2 is the client's content, not a migration — the document is created in
`/admin` like any other page. That also means it must be created in **both
locales in the same session**, per the array-field locale gotcha in
`CLAUDE.md`.

## Not chosen

- **One monolithic `machinesLanding` block.** Its only justification was the
  shared selected-line state, which this change deletes.
- **A family block with visitor-facing tabs.** The selector again, in a block.
- **Deleting `/machines/[family]` and selecting the family on `/machines`.**
  Considered, since the family pages are near-orphans today. Rejected: the
  family page is a superset, not a duplicate — `SpecsCompare` and
  `InstallationsGallery` have nowhere else to live, and a product catalogue
  needs a shareable URL per line. The orphan problem is a linking bug, fixed
  above.
- **Keeping the route and adding a `layout` field to it.** Gets the ordering
  without the SEO fields, which are the actual reason to do this.
- **Moving the detail routes too.** Larger, and no forcing reason yet.

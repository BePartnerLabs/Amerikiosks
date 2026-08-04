# `/machines` as a normal page — design

> Turns the hard-coded machines landing into a `pages` document composed of
> blocks, so the client owns its copy, its SEO and its section order. The
> interactive lineup stays one block, not three.

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
  `MachinesModels` all sit inside `MachinesLandingProvider` and react to the
  *selected line*. They are one interactive unit that happens to render as
  three bands, not three independent sections.
- **`CollectionPage` JSON-LD**, built from the families.

## Why bother

**The reason is SEO ownership, not layout flexibility.** Today the page's
`title` and `description` come from `getTranslations('machines')` — they live
in message files, in the repo. The client cannot edit the meta description of
one of the most important pages on the site without a developer and a deploy.
As a `pages` document it inherits the `plugin-seo` fields like every other
page. That is also the pending work item about documents with no `meta.title`:
this page cannot be fixed there while it is a route.

Secondary, and real but smaller: the client can put a CTA, an FAQ or a trust
strip around the lineup, and reorder them, without a release.

## The change

**One block, not three.** Add a `machinesLanding` block that owns
`MachinesLandingProvider` and the three sections inside it. Its `Server.tsx`
does the queries and the derived-data computation the route does today, and
emits the JSON-LD. The editor gets the block's own fields (eyebrow, heading,
trust strip copy) and nothing that has to stay computed.

Splitting the provider across three separately-orderable blocks is the obvious
alternative and it does not work: the sections would stop sharing the selected
line, which is the whole interaction.

`/machines` then becomes a `pages` document whose layout is
`[machinesLanding, …whatever the client adds]`, and
`[locale]/machines/page.tsx` is deleted.

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

## What must not regress

- **`/maquinas` keeps working.** Existing links, the sitemap and anything the
  client has shared point at it. The slug must be `maquinas` in ES from day
  one; a redirect row is the fallback, not the plan.
- **The route stays server-rendered.** `pages` routes are already `ƒ`. Do not
  reach for `generateStaticParams` here — it is what took
  `/machines/[family]` down in production once.
- **`GATED_PATHS=/machines` keeps gating it.** The check is path-based
  (`utilities/gatedPaths.ts`), so it is indifferent to how the path resolves —
  worth asserting in a test rather than assuming.
- **The derived numbers stay derived.** If the lineup scale or the model count
  becomes an authorable field during this refactor, the change has failed: it
  will silently disagree with the machines collection within a month.
- **`modelLines` keeps working on the detail page**, where `RelatedMachines`
  renders it directly.

## Migration

The page has to exist before the route is deleted, and it carries content, so
this is content plus code:

1. Ship the `machinesLanding` block, registered in `Pages`, with the route
   still in place. Nothing changes for visitors.
2. Create the `pages` document (slug `machines` / `maquinas`) with the block,
   in both locales, and fill the SEO fields. Verify it at a preview URL —
   the route still wins for `/machines` at this point.
3. Delete `[locale]/machines/page.tsx` and the `'/machines'` entry from
   `pathnames`. Now the page serves the URL.
4. Verify `/machines`, `/es/maquinas`, `/maquinas` → redirect, and that the
   two child routes still resolve.

Step 2 is the client's content, not a migration — the document is created in
`/admin` like any other page. That also means it must be created in **both
locales in the same session**, per the array-field locale gotcha in
`CLAUDE.md`.

## Not chosen

- **Three orderable blocks.** Breaks the shared selected-line state.
- **Keeping the route and adding a `layout` field to it.** Gets the ordering
  without the SEO fields, which are the actual reason to do this.
- **Moving the detail routes too.** Larger, and no forcing reason yet.

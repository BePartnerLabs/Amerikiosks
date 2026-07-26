## 1. Collections

- [ ] 1.1 Create `src/collections/MachineFamilies/index.ts` (`machine-families`): `name` (text, required, localized), `slug` (`slugField({ useAsSlug: 'name' })`, not localized), `tagline` (text, localized), `description` (textarea, localized), `thumbnail` (upload → media, required), `ctaLabel` (text, localized, default "Know more"), `highlights` (group: `eyebrow`, `heading`, `items[]` with `icon`/`image` + `title` + `description`, same shape as `Machines.highlights`), `meta` (SEO group, same pattern as `Machines`). Access: `read: anyone`, rest `authenticated`. Versions/drafts like `Machines`.
- [ ] 1.2 Create `src/collections/MachineInstallations/index.ts` (`machine-installations`): `client` (relationship → `partners`, required), `location` (text, optional, localized), `machine` (relationship → `machines`, required), `photos` (array, required, min 1, `{ image: upload required }`). Access: `read: anyone`, rest `authenticated`. No drafts.
- [ ] 1.3 Add `family` field to `src/collections/Machines/index.ts` after `tags`: `relationship` → `machine-families`, `required: true`, admin description "Product series this model belongs to (e.g. Alpha, Gamma)".
- [ ] 1.4 Register `MachineFamilies` and `MachineInstallations` in `src/payload.config.ts` collections array.
- [ ] 1.5 Run `pnpm payload migrate:create`, review generated SQL, then `pnpm payload migrate`.
- [ ] 1.6 Run `pnpm generate:types` and `pnpm generate:importmap`.

## 2. Reserved slugs on Pages

- [ ] 2.1 Add a `beforeValidate` hook to `src/collections/Pages/index.ts` (or a new `src/collections/Pages/hooks/reservedSlug.ts`) that rejects `slug` values in `['machines', 'insights', 'faq', 'customer-service', 'projects', 'search']` with a clear validation error.
- [ ] 2.2 Manually verify in `/admin` that creating/renaming a Page to slug `machines` is rejected with a readable error message.

## 3. Content seeding (blocking for verification)

- [ ] 3.1 In `/admin`, create the 6 `machine-families` documents (Alpha, Beta, Gamma, Delta, Zeta, Kappa) with `tagline`, `description`, `thumbnail`, and `highlights.items` (4 cards each) — needed before Task 3.2 since `machines.family` is required.
- [ ] 3.2 Assign `family` to each existing `machines` document (Alpha 10, Alpha 13, Delta 7, Gamma 10, Gamma 13, Gamma 13 Double, Kappa 13, Kappa 13 Double, Kappa Showcase Blanco, Zeta 2).
- [ ] 3.3 Create 1-2 `machine-installations` test documents (client from `partners`, linked `machine`, 2+ `photos`) to verify the fallback-hidden vs. fallback-shown states.

## 4. Home block — ModelLines

- [ ] 4.1 Create `src/blocks/ModelLines/config.ts` (Payload block config, slug `modelLines`) following the `FormatsGrid`/`CardGrid` pattern — `eyebrow`/`heading`/`subheading` fields (the block itself has no other admin-configurable fields; family list is always all `machine-families`).
- [ ] 4.2 Create `src/blocks/ModelLines/Server.tsx`: `payload.find({ collection: 'machine-families', sort: 'name', locale })`.
- [ ] 4.3 Create `src/blocks/ModelLines/Component.tsx` and `styles.css`: horizontal row of family cards (thumbnail + name), each linking to `/machines/[family.slug]` via `@/i18n/routing` `Link`. Reuse `SectionHeader` like `FormatsGridBlock`.
- [ ] 4.4 Register `modelLines: ModelLinesServer` in `src/blocks/RenderBlocks.tsx` `blockComponents`.
- [ ] 4.5 Add `ModelLines` to the `layout.blocks` array in `src/collections/Pages/index.ts`.
- [ ] 4.6 Extract the family-row visual into a shared component (e.g. `src/components/ModelLinesRow.tsx`) so it can be reused by `/machines`, `/machines/[family]`, and the block itself without duplicating markup.

## 5. /machines landing page

- [ ] 5.1 Create `src/app/(frontend)/[locale]/machines/page.tsx`: fetch all `machine-families` (locale-aware), render the shared family row (Task 4.6) plus a sticky nav with anchors to each `#family-slug`.
- [ ] 5.2 Render one section per family: `tagline`/`description`, `ctaLabel` button linking to `/machines/[family.slug]`, and a grid of the 4 `highlights.items` cards.
- [ ] 5.3 Add `generateMetadata` for the page (title/description), following the pattern used in `machines/[slug]/page.tsx`.

## 6. /machines/[family] page

- [ ] 6.1 Create `src/app/(frontend)/[locale]/machines/[family]/page.tsx`: resolve `machine-families` by slug via `payload.find({ where: { slug: { equals } } })`; call `notFound()` if none found.
- [ ] 6.2 Add `generateStaticParams` (all family slugs) and `generateMetadata`, mirroring `machines/[slug]/page.tsx`.
- [ ] 6.3 Render the shared family row (Task 4.6) with the current family highlighted.
- [ ] 6.4 Render the family's narrative section (`tagline`/`description`/`highlights.items`), same content as its `/machines` section but expanded (not summarized).
- [ ] 6.5 Query real models: `payload.find({ collection: 'machines', where: { family: { equals: familyId } }, locale })`, render with `MachineCard` from `src/blocks/MachinesListing/MachineCard.tsx`; each card links to `/machines/[machine.slug]`.
- [ ] 6.6 Query installations: `payload.find({ collection: 'machine-installations', where: { 'machine.family': { equals: familyId } } })`; render a gallery section (client logo/name + photos) only if `docs.length > 0` — otherwise render nothing for that section.
- [ ] 6.7 Add a "View all lines" button linking to `/machines`.

## 7. Related machines → related families

- [ ] 7.1 Rewrite `src/app/(frontend)/[locale]/machines/[slug]/RelatedMachines.tsx` to query `machine-families` excluding the current model's `family` (instead of `machines` excluding the current slug).
- [ ] 7.2 Render each result using the shared family row/card (Task 4.6) instead of `MachineCard`.
- [ ] 7.3 Add a "View all models" button linking to `/machines`.
- [ ] 7.4 Update the caller in `src/app/(frontend)/[locale]/machines/[slug]/page.tsx` to pass whatever new props `RelatedMachines` now needs (e.g. the current machine's resolved `family` id/slug instead of just `currentSlug`).

## 8. Existing MachinesListing usage cleanup

- [ ] 8.1 In `/admin`, find every `pages` document that currently has a `machinesListing` block in its `layout`.
- [ ] 8.2 For each, replace the block with a link/CTA to `/machines` or `/machines/[family]` as appropriate, or remove it if redundant with the new pages. Do not delete the `MachinesListing` block from the codebase.

## 9. Client Manual

- [ ] 9.1 Add a section to `docs/CLIENT-MANUAL.md`: how to create/edit a `machine-family` (fields, highlights, thumbnail).
- [ ] 9.2 Add a bullet: how to assign `family` to a `machine` (required field, must exist before saving).
- [ ] 9.3 Add a bullet: how to add `machine-installations` (client from `partners`, machine, photos) and the fallback behavior (no installations → section hidden).

## 10. Verification

- [ ] 10.1 `pnpm generate:types` and `pnpm tsc --noEmit` pass with no errors.
- [ ] 10.2 `pnpm dev`: verify `ModelLines` block renders on Home once added via `/admin`.
- [ ] 10.3 Verify `/machines`: sticky nav, all 6 family sections with highlights, "Know more" buttons link correctly.
- [ ] 10.4 Verify `/machines/alpha` (or seeded slug): family row, narrative, real Alpha models grid linking to model detail pages, installations section present/absent matches seeded data.
- [ ] 10.5 Verify removing all `machine-installations` for a family hides that section on `/machines/[family]` without layout breakage.
- [ ] 10.6 Verify `machines/[slug]` "Find the right kiosk for your space" now shows sibling families (not random models) and "View all models" links to `/machines`.
- [ ] 10.7 In `/admin`, verify creating a `pages` document with slug `machines` is rejected.
- [ ] 10.8 Verify EN/ES locale switch on `/machines` and `/machines/[family]` shows translated family content with the same URL slug in both locales.

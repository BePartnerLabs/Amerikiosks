# Roadmap

Future ideas and planned improvements for the Amerikiosks website. Items are grouped by theme, not prioritized — move to a spec when ready to implement.

---

## SEO & Discoverability

- **`llms.txt` support** — Add `/llms.txt` and `/llms-full.txt` routes (markdown overview of the site for AI assistants). Gated by the `noIndex` Settings flag — returns a minimal "not available" response when blocked, serves site description + page index when public.
- ~~**PR labeler**~~ — done, `.github/workflows/labeler.yml` (centralized-workflows) auto-labels PRs by branch prefix/content.
- ~~**Changelog grouped by type**~~ — done via Release Drafter (centralized-workflows) using the labeler's labels — release notes already group into Features/Bug Fixes/Maintenance (see the v1.15.0 release), no custom `git log` parser needed.

---

## Admin / CMS

- **TrustStrip WCAG 2.2.2 keyboard pause** — Add a visually-hidden pause/play toggle button to the marquee carousel so keyboard users without `prefers-reduced-motion` can pause animation. Currently documented as a known limitation in `src/blocks/TrustStrip/README.md`.
- **TrustStrip screenshots** — Take desktop (1280px) and mobile (375px) screenshots with real partner logos seeded and add to `src/blocks/TrustStrip/README.md` to reach 80%+ completeness score.
- **Partner drag-to-reorder** — Replace the `order` number field with a drag-and-drop interface in admin. Requires a `PartnerOrder` Global or a custom Payload UI component.
- **Batch "Releases" + writer approval workflow** — Explored 2026-07-19, not committed. Two related asks from the client: (1) group several documents across collections into a named "release" with a message, publish/unpublish them together (~3-5 dev days: `Releases` collection + relationship + batch publish/unpublish hooks + custom admin UI); (2) writers can only save drafts, an approver actually publishes (~1-1.5 dev days: `reviewStatus` field + `access` control gate, no plugin covers this — Payload's Enterprise "Publishing Workflows" is approval/notifications-focused, not release-grouping). Reviewer "pending review" panel: per-collection filtered list view is free with the `reviewStatus` field; a unified cross-collection inbox is a custom admin view, +1 day. **Validate scope with the client once the full collection set is locked, not just for the first release — for the first complete project close-out.**
- **`docs/CLIENT-MANUAL.md` drift enforcement** — Checked 2026-07-24: the outline went untouched from 2026-07-20 21:27 (`b24b55c`) through 6 shipped feature PRs (async JotForm/Settings sync, ClaimForm wizard rebuild + R2 photo storage, customer-service UX polish, Form-fields DS migration, mega-menu/hero rework, Monday.com claims integration) before this check caught it. The two-speed policy in the top-level `CLAUDE.md` (bullet-per-iteration, full prose write-up only at project close) is still the right call — several of those blocks (ClaimForm, Support Hub) got rewritten mid-project, so full-detail sections would've needed rewriting twice. What's missing is enforcement: nothing currently prompts a manual-outline check at PR time. Add it as a checklist item in the PR template (or `/finishing-a-development-branch`) for any change touching a client-facing `/admin` workflow, rather than relying on remembering.
- **Generic multi-step/panel grouping for `src/blocks/Form`** — Raised 2026-07-24 while designing the kiosk-development/placement-application forms (`openspec/changes/kiosk-development-application/`, `openspec/changes/placement-application/`): both are long (12-16 fields) and render in the shared modal drawer (`CMSLink` `type: 'modal'` → `FormBlock`), which could feel cramped as one flat scroll. Deliberately deferred rather than bundled into either form's spec — it's a standalone UI feature (step navigation, per-step validation, progress indicator) that would affect every form using the generic drawer (Brand/Venue/Agency/Emerging-Brand/Start-a-Partnership too), not just these two. Ship both forms flat first; revisit step-grouping as its own design once real content is loaded and it's clear whether the flat drawer actually feels cramped, rather than guessing upfront. If built, would likely need a per-field "step" grouping config on the `Form` doc (mirrors the `externalId` per-field override pattern from the sync-integration work) and a stepper UI in `FormBlock`/the drawer, closer to `ClaimForm`'s wizard than a full rebuild.

---

## Infrastructure

- ~~**Branch protection enforcement**~~ — done. `main` requires `lint / Lint` and `test / Unit tests` status checks; direct pushes are blocked for all contributors.
- **`llms.txt` + markdown pages** — Payload-driven markdown pages served at known URLs (e.g. `/about.md`, `/services.md`) for AI agent consumption, following the `llms.txt` spec.
- **Convert `[locale]/[slug]/page.tsx` to a catch-all (`[...slug]`)** — `nestedDocsPlugin` is already active on `pages`, but setting a `parent` on a doc only affects breadcrumbs/SEO `generateURL` metadata, not actual Next.js routing: the App Router resolves URLs purely by folder structure, and `[slug]` only matches a single segment. Any page nested under another (e.g. `/customer-service/request-a-refund`) needs its own bespoke route folder today (see that page's route for the current workaround). Converting to `[...slug]` would make nested pages "just work" without a dedicated folder per case, but touches routing for every page on the site: `generateStaticParams` would need to build full breadcrumb paths instead of a single slug, `queryPageBySlug` would need to match a joined path (likely via a denormalized `fullPath` field kept in sync by a hook) instead of `where: { slug: { equals } }`, the `home` special case (`slug === 'home'` → `/`) needs adapting to an empty array, and `PayloadRedirects`/`translate-slug`/the SEO plugin's `generateURL` all currently assume a flat single-segment slug and would need auditing. Worth doing once there's a second/third nested-page case, but deserves its own reviewed plan rather than being bundled into unrelated feature work.
  - **Analyze whether `nestedDocsPlugin` itself could resolve this more directly** before building the catch-all migration by hand — worth a spec-first look at whether the plugin already exposes (or could be configured to expose) the joined path in a form `generateStaticParams`/`queryPageBySlug` could consume directly, instead of us hand-rolling a `fullPath` denormalization hook from scratch.
- **shadcn primitives → DS migration** — `Select` was already replaced with a native `<select>` (real bug: Radix portals to `document.body`, which sits below a native-popover drawer's top-layer). The rest (`Button`, `Input`, `Label`, `Checkbox`, `Textarea`, `Pagination` in `src/components/ui/`) are still shadcn wrappers with no active bug — migrate to `ds.bepartnerlabs.com` components when there's a dedicated pass for it, not bundled into unrelated feature work.
- ~~**`vercel` CLI 54→56**~~ — done, bumped clean, no issues (`chore/bump-vercel-cli`).
- **Pending major dep bumps — investigated 2026-07-21, both genuinely blocked (not env flakiness):**
  - **`typescript` 6→7** — attempted on `chore/upgrade-typescript-7`. `tsc --noEmit` fails immediately under TS7 because it removed the `baseUrl` compiler option. Vitest doesn't catch this (it type-strips via esbuild, no real typecheck) — `pnpm test:int` passes even when the project doesn't actually compile, so don't use test results alone as a green light for TS bumps. Fixed the *config-level* half of this: dropped `baseUrl` (paths already resolve relative to `tsconfig.json` without it), fixed 4 files with bare `src/...` imports that only worked via `baseUrl` (`src/blocks/Banner/Component.tsx`, `src/collections/Insights/hooks/populateAuthors.ts`, `src/heros/PostHero/index.tsx`, `src/utilities/getDocument.ts`), and fixed 2 real generic-type regressions in `src/utilities/getDocument.ts`/`getGlobals.ts` (were hand-rolling `keyof Config['collections']`/`keyof Config['globals']`, which TS7 widens to `string | number | symbol` — switched to Payload's own exported `CollectionSlug`/`GlobalSlug` types instead, which is more correct regardless of TS version). With all of that, `tsc --noEmit` passes clean under TS7 — but `pnpm build` still fails: Next.js 16.2.10's own build-time TypeScript version detection doesn't understand TS7 and crashes with `The "id" argument must be of type string. Received undefined` after trying to reinstall `typescript`. This is a Next.js-side gap, not fixable from this repo — retry once Next.js ships TS7 support. The tsconfig/import/type fixes above are harmless under TS6 too and worth keeping regardless.
  - **`@vitejs/plugin-react` 4→6** — hard startup failure, `ERR_PACKAGE_PATH_NOT_EXPORTED` on `vite/internal` when vitest loads its config; the installed `vite@7.3.6` (pulled in transitively by vitest) doesn't expose the subpath plugin-react 6 imports. Reproduced twice in isolation, not a fluke. Needs a compatible `vite`/`vitest` pairing investigated before retrying.
  - **`graphql` 16→17** — do not attempt: `payload` and `@payloadcms/next` both pin `"graphql": "^16.8.1"` as a hard peer dependency. Blocked until Payload ships v17 support.
  - Also learned: this repo's local dev DB runs via Podman (`podman-compose up -d`, needs `podman machine start` first if the VM isn't running) — `tests/int/redirects.int.spec.ts` needs a real Postgres connection and will fail/timeout with a misleading "hook timed out" error if the machine isn't up. Check `podman-compose ps` before blaming a dependency bump for integration test failures.

---

## Design System

- **Narrow "prose" lane on `.bp-content-grid`** — Discussed 2026-07-20 while building the legal pages (Privacy/Cookie/Terms). `.bp-content-grid` (`src/app/(frontend)/globals.css`) currently exposes `full-width` / `breakout` / `content` named lines, with `content` maxing out at 1344px — fine for marketing layouts (cards, heroes) but too wide for a wall of body text (blog posts, legal pages), where comfortable line length is closer to ~44rem. Shipped a stopgap for now: `max-width: 44rem; margin-inline: auto;` scoped to `.ak-content .ak-rich-text` in `src/blocks/Content/styles.css` — narrows the *text*, not the grid. The more correct fix is a new named line on the shared grid itself (e.g. `[prose-start]...[prose-end]`, narrower than `content`) so blog/legal content can opt in via `grid-column: prose`, consistent with how `breakout`/`full-width` already work. Deliberately not done in the GDPR branch — it touches a primitive shared by every block on the site and belongs in its own design-system spec (`openspec/specs/design-system/spec.md`), not bundled into unrelated feature work.

---

## Platform / Reusable Tooling

- **Extract the Monday.com integration into a reusable internal package** — Built 2026-07-25/26 for the generic Form → Monday sync (`src/repositories/GenericMondayRepository.ts`, `src/Settings` boards cache + refresh/curation UI, `src/plugins/components/Monday*.tsx` board/group pickers, `src/utilities/detectMondayDrift.ts`). Everything except `MondayRepository.ts` (Claims-specific) is generic: cache boards/groups/columns on demand, pick a board/group with a synced-options dropdown + manual fallback, a read-only columns reference panel, per-field column-id validation, and a drift-check list of connected forms. Nothing here depends on Amerikiosks-specific business logic. Worth packaging as an internal Payload plugin (alongside `internal-projects/bpl-ds`, `centralized-workflows`) once a second client project needs a Monday.com form integration — install once, wire up `mondayApiToken` + `integrationTarget`, done. Not worth the packaging overhead for a single consumer today.

---

## Analytics

- **TrustStrip dwell time dashboard** — `partner_logo_dwell` events are firing to GA4. Create a GA4 custom report or Looker Studio dashboard to visualize which partner logos get the most screen time.
- **Mark `generate_lead` and `claim_submit` as GA4 Key Events** — manual step in GA4 Admin → Events → toggle "Mark as key event". Code already fires both (declarative `data-ga-event` + synthetic-click pattern); `form_start`/`form_submit` are separately auto-collected by GA4 Enhanced Measurement, no code needed for those.
- ~~**Confirm JotForm question-ID mapping before relying on it in production**~~ — done. Verified against the live JotForm form's actual HTML (question IDs, option text); `src/repositories/JotFormRepository.ts` rewritten to match, no placeholder TODO left.

---

## Content

- ~~**Seed TrustStrip block on home page**~~ — done, `src/endpoints/seed/pages/home.ts` includes `trustStripBlock` in both locales.

---

## Client Manual (final usage guide)

- **Hiding a layout block without deleting it** — set a block's "Block Name" (admin field, top of each block in the Layout list) to exactly `hidden` (case-insensitive, e.g. `Hidden`) and it stops rendering on the page while staying fully configured. Useful for sections still waiting on content that shouldn't block a release. A name that merely *contains* "hidden" (e.g. `Hidden promo (old)`) still renders — only an exact match toggles it off. Implemented in `src/blocks/RenderBlocks.tsx`.

---

## GDPR / Privacy Compliance

Audited 2026-07-19 — site did not comply, no consent mechanism existed at all. Implemented on `feat/gdpr-consent-banner`.

- ~~**Cookie consent gate for GA4**~~ — done. GA4 `<Script>` in `src/app/(frontend)/[locale]/layout.tsx` is now gated behind an `ak_consent` cookie read server-side; see `src/components/ConsentBanner/`.
- ~~**Privacy Policy page**~~ — done, seeded (`src/endpoints/seed/pages/privacy-policy.ts`), content from the client's own draft.
- ~~**Cookie Policy page**~~ — done, seeded (`src/endpoints/seed/pages/cookie-policy.ts`).
- ~~**Terms of Service page**~~ — done, seeded (`src/endpoints/seed/pages/terms-and-conditions.ts`), replaces the old WordPress 2023 WooCommerce boilerplate that didn't match the current B2B site.
- ~~**Consent preference center**~~ — done, `ConsentPreferencesButton` (floating, bottom-left) reopens the banner at any time.
- ~~**Server-side consent log**~~ — done on `feat/consent-server-log`, per client request after a prior (unrelated, accessibility) lawsuit — the cookie alone isn't durable evidence if a user clears it. `ConsentLogs` collection (`src/collections/ConsentLogs.ts`) records a random `consentId` + the choice + a timestamp on every accept/reject/save, written via `/next/consent-log`. No IP, fingerprint, or other personal identifier is stored — the same `consentId` is also written into the `ak_consent` cookie, so only someone who actually went through the real consent flow on their own device can present a matching id to prove they consented.
- **PII consent checkbox on lead-capture forms** — still open. Brand/Venue/Agency/Emerging-Brand/Start-a-Partnership forms all collect name/email/phone/company with no visible opt-in or purpose/retention disclosure at the point of capture.
- Not a gap: JotForm integration (`JotFormRepository`) is server-to-server (API calls), not a client embed — no extra third-party cookies from it. No other ad-tech/fingerprinting scripts found in a first pass.
- All three legal pages are a functional draft, not legal advice — CCPA applicability, PCI-DSS payment language, and Curaçao/El Salvador-specific requirements still need review by qualified counsel before they're final.

---

## Launch checklist (WordPress decommission)

- **Scan a real QR code on a deployed kiosk** against a preview deploy before decommissioning WordPress — confirms the `machine_id` query param printed on physical kiosks still resolves correctly end to end. The QR encodes `/customer-service?machine_id=...` (the Support Hub landing page, not the refund form directly) — `SupportHub` (`src/blocks/SupportHub/Component.tsx`) reads `machine_id` off that page's own URL and forwards it onto the "Request a refund" link, so `ClaimForm` (a separate URL) still has it in its own `searchParams` when the customer arrives there. Full chain documented in `docs/superpowers/specs/2026-07-22-monday-claims-integration-design.md` § 5.
- **Check Neon's branch-expiration setting** (dashboard, or the Vercel↔Neon integration config) — confirm whether preview-deployment branches auto-delete on a timer and after how long, so nobody loses a staging branch they meant to keep using.

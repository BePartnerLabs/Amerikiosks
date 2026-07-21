# Roadmap

Future ideas and planned improvements for the Amerikiosks website. Items are grouped by theme, not prioritized — move to a spec when ready to implement.

> This PR also verifies the centralized labeler and release-drafter workflows are wired correctly.

---

## SEO & Discoverability

- **`llms.txt` support** — Add `/llms.txt` and `/llms-full.txt` routes (markdown overview of the site for AI assistants). Gated by the `noIndex` Settings flag — returns a minimal "not available" response when blocked, serves site description + page index when public.
- **PR labeler (no external deps)** — GitHub Actions workflow that reads branch prefix (`feat/`, `fix/`, `docs/`) and PR commit messages to auto-apply labels. Release Drafter uses these labels to categorize changelog entries.
- **Changelog from semantic commits** — Switch `release-draft.yml` from `--generate-notes` (PR titles only) to a custom `git log` parser that groups entries by commit type (`feat`, `fix`, `perf`, `docs`) for richer release notes.

---

## Admin / CMS

- **TrustStrip WCAG 2.2.2 keyboard pause** — Add a visually-hidden pause/play toggle button to the marquee carousel so keyboard users without `prefers-reduced-motion` can pause animation. Currently documented as a known limitation in `src/blocks/TrustStrip/README.md`.
- **TrustStrip screenshots** — Take desktop (1280px) and mobile (375px) screenshots with real partner logos seeded and add to `src/blocks/TrustStrip/README.md` to reach 80%+ completeness score.
- **Partner drag-to-reorder** — Replace the `order` number field with a drag-and-drop interface in admin. Requires a `PartnerOrder` Global or a custom Payload UI component.
- **Batch "Releases" + writer approval workflow** — Explored 2026-07-19, not committed. Two related asks from the client: (1) group several documents across collections into a named "release" with a message, publish/unpublish them together (~3-5 dev days: `Releases` collection + relationship + batch publish/unpublish hooks + custom admin UI); (2) writers can only save drafts, an approver actually publishes (~1-1.5 dev days: `reviewStatus` field + `access` control gate, no plugin covers this — Payload's Enterprise "Publishing Workflows" is approval/notifications-focused, not release-grouping). Reviewer "pending review" panel: per-collection filtered list view is free with the `reviewStatus` field; a unified cross-collection inbox is a custom admin view, +1 day. **Validate scope with the client once the full collection set is locked, not just for the first release — for the first complete project close-out.**

---

## Infrastructure

- **Branch protection enforcement** — Several recent commits bypassed branch protection ("Changes must be made through a pull request"). Enforce required status checks (`Lint and Test`) so direct pushes to `main` are blocked for all contributors.
- **`llms.txt` + markdown pages** — Payload-driven markdown pages served at known URLs (e.g. `/about.md`, `/services.md`) for AI agent consumption, following the `llms.txt` spec.
- **Convert `[locale]/[slug]/page.tsx` to a catch-all (`[...slug]`)** — `nestedDocsPlugin` is already active on `pages`, but setting a `parent` on a doc only affects breadcrumbs/SEO `generateURL` metadata, not actual Next.js routing: the App Router resolves URLs purely by folder structure, and `[slug]` only matches a single segment. Any page nested under another (e.g. `/customer-service/request-a-refund`) needs its own bespoke route folder today (see that page's route for the current workaround). Converting to `[...slug]` would make nested pages "just work" without a dedicated folder per case, but touches routing for every page on the site: `generateStaticParams` would need to build full breadcrumb paths instead of a single slug, `queryPageBySlug` would need to match a joined path (likely via a denormalized `fullPath` field kept in sync by a hook) instead of `where: { slug: { equals } }`, the `home` special case (`slug === 'home'` → `/`) needs adapting to an empty array, and `PayloadRedirects`/`translate-slug`/the SEO plugin's `generateURL` all currently assume a flat single-segment slug and would need auditing. Worth doing once there's a second/third nested-page case, but deserves its own reviewed plan rather than being bundled into unrelated feature work.
  - **Analyze whether `nestedDocsPlugin` itself could resolve this more directly** before building the catch-all migration by hand — worth a spec-first look at whether the plugin already exposes (or could be configured to expose) the joined path in a form `generateStaticParams`/`queryPageBySlug` could consume directly, instead of us hand-rolling a `fullPath` denormalization hook from scratch.
- **shadcn primitives → DS migration** — `Select` was already replaced with a native `<select>` (real bug: Radix portals to `document.body`, which sits below a native-popover drawer's top-layer). The rest (`Button`, `Input`, `Label`, `Checkbox`, `Textarea`, `Pagination` in `src/components/ui/`) are still shadcn wrappers with no active bug — migrate to `ds.bepartnerlabs.com` components when there's a dedicated pass for it, not bundled into unrelated feature work.

---

## Design System

- **Narrow "prose" lane on `.bp-content-grid`** — Discussed 2026-07-20 while building the legal pages (Privacy/Cookie/Terms). `.bp-content-grid` (`src/app/(frontend)/globals.css`) currently exposes `full-width` / `breakout` / `content` named lines, with `content` maxing out at 1344px — fine for marketing layouts (cards, heroes) but too wide for a wall of body text (blog posts, legal pages), where comfortable line length is closer to ~44rem. Shipped a stopgap for now: `max-width: 44rem; margin-inline: auto;` scoped to `.ak-content .ak-rich-text` in `src/blocks/Content/styles.css` — narrows the *text*, not the grid. The more correct fix is a new named line on the shared grid itself (e.g. `[prose-start]...[prose-end]`, narrower than `content`) so blog/legal content can opt in via `grid-column: prose`, consistent with how `breakout`/`full-width` already work. Deliberately not done in the GDPR branch — it touches a primitive shared by every block on the site and belongs in its own design-system spec (`openspec/specs/design-system/spec.md`), not bundled into unrelated feature work.

---

## Analytics

- **TrustStrip dwell time dashboard** — `partner_logo_dwell` events are firing to GA4. Create a GA4 custom report or Looker Studio dashboard to visualize which partner logos get the most screen time.
- **Mark `generate_lead` and `claim_submit` as GA4 Key Events** — manual step in GA4 Admin → Events → toggle "Mark as key event". Code already fires both (declarative `data-ga-event` + synthetic-click pattern); `form_start`/`form_submit` are separately auto-collected by GA4 Enhanced Measurement, no code needed for those.
- **Confirm JotForm question-ID mapping before relying on it in production** — `src/repositories/JotFormRepository.ts` has placeholder question IDs flagged with a TODO. Verify against the real JotForm form before decommissioning WordPress.

---

## Content

- **Seed TrustStrip block on home page** — After running the seed, the home page still needs a TrustStrip block added manually in `/admin`. Automate this in `src/endpoints/seed/pages/home.ts` so the section appears out of the box after seeding.

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

- **Scan a real QR code on a deployed kiosk** against a preview deploy before decommissioning WordPress — confirms the `/customer-service/request-a-refund?machine_id=...` URL printed on physical kiosks still resolves correctly end to end.
- **Check Neon's branch-expiration setting** (dashboard, or the Vercel↔Neon integration config) — confirm whether preview-deployment branches auto-delete on a timer and after how long, so nobody loses a staging branch they meant to keep using.

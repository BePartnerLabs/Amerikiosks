# Client Manual — Outline

Working outline for the final content-editor usage manual. Each bullet is a topic to expand into its own section (screenshots, step-by-step) once we sit down to write the manual properly. Not for developers — this is the doc a non-technical content editor at Amerikiosks will use day to day in `/admin`.

---

## 1. Getting started

- Logging in to `/admin`, resetting a forgotten password
- Layout of the admin UI: sidebar collections vs. globals, the top account menu
- Draft vs. Published state — what "Save draft" vs. "Publish" actually does
- Live Preview — previewing a page before it's public

## 2. Pages

- Creating a new page, setting its slug and title
- The Layout Builder: adding, reordering (drag), and deleting blocks
- **Hiding a block without deleting it** — name it exactly `hidden` (see `docs/ROADMAP.md` → Client Manual)
- SEO tab per page: meta title, description, share image
- Parent/child pages (nested docs) and how that affects breadcrumbs

## 3. Layout blocks — what each one is for

- Hero variants (High/Medium/Low Impact) — when to use which
- Card Grid — compact / icon / pillar variants, when each fits
- Trust Strip — the auto-scrolling logo strip, adding/reordering partners
- Content, Media, CTA, Archive — general-purpose blocks
- Audience Showcase, Formats Grid, Process Steps — structured multi-item blocks
- FAQ + Form, Claim Form, Support Hub, Machines Listing — specialized blocks
- **Support Hub → Claim Form: the `machine_id` link** — the kiosk's printed QR code encodes `machine_id` on the Support Hub page's own URL; Support Hub automatically carries it over onto the "Request a refund" button so the claim ends up tagged with the originating kiosk (visible in `/admin` and forwarded to Monday.com's "Kiosk ID" column, if that integration is enabled — see Settings below). Nothing to configure — this is automatic as long as the QR code itself still points at the Support Hub page with `?machine_id=...`.
- Projects Showcase, Insights Showcase — pull from other collections, not manually authored

## 4. The Link field — three ways a button/link can behave

- Internal page link vs. custom URL vs. **"Open a modal form"**
- When to use the modal-form type (e.g. "Start a Partnership") vs. a real page

## 5. Bold text in headings

- The `**text**` syntax to bold part of a block heading (SectionHeader-based blocks)

## 6. Insights (blog/news)

- Creating a post, categories, authors
- Draft/preview/publish workflow (same as Pages)
- How Insights feeds the site search index automatically (nothing to configure)

## 7. Other collections

- Machines catalog — adding a machine, tags, images
- FAQ Items — reusable across pages via the FAQ block
- Partners — logos shown in Trust Strip, the `order` field
- Projects — case studies shown in Projects Showcase
- Categories — taxonomy for Insights

## 8. Forms

- Creating/editing a form (form-builder plugin): fields, confirmation message, notification email
- Connecting a form to a button via the Link field's modal type
- Where form submissions go / how to check them

## 9. Header & Footer (site-wide)

- Editing nav items, the mega menu panels
- **Hiding a nav item** without deleting it (existing `hidden` checkbox on nav items)
- The header CTA button — URL vs. modal form
- Footer links and content

## 10. Settings (site-wide)

- `noIndex` flag — hiding the entire site from search engines (staging use)
- **Integrations tab** — API keys/tokens for the refund-claim sync (Monday.com). Only visible/editable to logged-in admins; each claim's "Integration target" (in the Claims collection, sidebar) decides which one a given claim is sent to
- Any other global toggles

## 10a. Consent Logs (cookie-consent audit trail)

- Read-only collection at `/admin/collections/consentLogs` (requires an admin login) — one entry per accept/reject/save on the cookie banner, kept as evidence that consent was requested and recorded
- Contains only a random id, the choice made, and the date — no IP address or other personal data
- Nothing to edit here day-to-day; it exists for legal/audit purposes only

## 10b. Accessibility widget (site-wide)

- The round accessibility button at the bottom-left of every page opens a panel with **text size** (normal / large / larger), **high contrast**, **highlight links**, **reduce motion**, and **read aloud**
- It is always on and needs **no configuration in `/admin`** — there is nothing to enable, schedule, or fill in
- Each visitor's choices are remembered in their own browser only; they are not stored against any account and never leave the visitor's device
- Read aloud uses the browser's built-in speech engine (no third-party service, no cost). Once switched on, the visitor clicks any text on the page to hear it. It is hidden automatically in browsers that don't support speech
- The panel's wording is translated in the site's message files, not the CMS — changing that text is a developer task
- Important: this widget improves usability, but it is not the same thing as ADA/WCAG conformance. Conformance comes from the pages themselves (alt text on every image, meaningful link text, correct heading order) — the parts you control when writing content

## 11. Localization (EN / ES)

- How to switch locale in the admin
- What's shared vs. per-locale (layout structure is shared; most text fields are per-locale)
- Translating a page vs. creating a new one

## 12. Media library

- Uploading images, required alt text
- Image sizes Payload generates automatically (don't re-upload for each use)

## 13. Redirects

- Adding a redirect (old URL → new URL)
- When Payload creates one automatically vs. when to add one by hand

## 14. Publishing checklist

- Steps before going live with a change (preview, SEO check, mobile check)
- Who to contact for something outside the CMS (dev changes, DNS, hosting)

---

*Source material already captured in code comments / `docs/ROADMAP.md` should be cross-linked here rather than duplicated once each section is written out.*

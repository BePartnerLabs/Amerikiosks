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
  - **Card Link → "None"** makes a card purely informational (no click target, no CTA arrow)
- Trust Strip — the auto-scrolling logo strip, adding/reordering partners
- Content, Media, CTA, Archive — general-purpose blocks
- Audience Showcase, Formats Grid, Process Steps — structured multi-item blocks
  - **Audience Showcase:** each card chooses per item between "Link to a page" and "Open a modal form"
  - **Model Lines:** leave "Form to open" empty for the normal behaviour (panel → machine family page); set a form and every panel opens that form in the modal drawer instead
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

- Creating/editing a form (form-builder plugin): fields, confirmation message
- **Leads arrive in Monday.com, not by email.** The plugin shows an "Emails" panel on each form — it does nothing, because this site sends no email. Which board a form feeds is set per form in `Integration target` + the board/group pickers
- Connecting a form to a button via the Link field's modal type
- Where form submissions go / how to check them
- **The consent checkbox** — turn on `Requires consent` in the form's sidebar for anything that collects personal data (name, email, phone, company). The checkbox is then added automatically above the submit button and is required; `Consent text` is where the opt-in wording and the privacy-policy link go. Nothing to add field by field
- **Reading the consent record** — each submission shows a read-only "Consent given" tick and a "Consent at" date in its sidebar. They are written at the moment of capture and cannot be edited by hand, which is the whole point: they stand as evidence
- **Spam protection is automatic** — submissions are rate-limited, screened for bots, and validated before anything is stored. Nothing to configure per form. Optionally, `Settings → Security` holds the Cloudflare Turnstile toggle and its two keys; turning it on adds an invisible bot check across every form at once. Leave it off until both keys are filled in — on without keys would reject real submissions
- **The text around the form** — each form document has its own `Description` (the paragraph under the title, which is what shows inside the modal drawer) and `Footnote` (the small print under the submit button, for reassurance rather than instructions)
- **The thank-you message** — `Confirmation heading`, the rich text body, and `What happens next`. Fill in the last one with a real timeframe ("we'll email you within 2 business days"); it is the line that decides whether the page reads as serious
- **Form block layout** — on a full page like `/contact`, the Form block can be set to `Split`, which puts a dark panel beside the fields, styled like the mega menu: `Panel eyebrow`, `Panel headline` and the block's Intro Content as the description. On phones the description drops and only the eyebrow and headline remain. Inside the modal drawer the layout is always stacked — it is too narrow for two columns
- **Field types available** — text, email, number, textarea, select, **radio** (all options visible, best for yes/no), **toggle** (a switch, same control as the cookie preferences panel), **date**, checkbox, country, state, upload, and *message* (not a question — a block of text that reads as a section separator between fields)
- **Text fields have a "Value type"** — *Plain text*, *Phone number* or *Website*. It is not cosmetic: Phone strips formatting before the value reaches Monday (its phone columns reject formatted numbers), and Website accepts "acme.com" and adds the https:// people leave out
- **"Autocomplete" on a field** lets the browser offer the visitor's saved details. Pick the meaning, not the field name — a company field should use *Company / brand name*, never *Full name*, or the browser offers the person's own name. Leave it empty to switch autofill off
- **Upload fields** — accept JPEG, PNG, WEBP and HEIC images up to 8MB. The file type is checked against the file's real content, so renaming something to `.jpg` will not get it through

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

## 10c. Redes sociales

- `Settings → Social` — una fila por red: se elige la plataforma de la lista (el logo sale de ahí) y se pega la URL completa del perfil (`https://…`)
- Aparecen automáticamente en tres lugares: la barra inferior del footer, el header en desktop y el menú hamburguesa en mobile. No hay nada que activar por zona
- El campo "Label" es opcional: solo cambia el texto que leen los lectores de pantalla (por defecto "Amerikiosks on Instagram")
- Además le avisan a Google qué perfiles son los oficiales de la marca (`sameAs`), lo que ayuda a que aparezcan en el panel de conocimiento
- Si la lista queda vacía, no se muestra nada en ningún lado

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

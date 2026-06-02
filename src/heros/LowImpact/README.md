# Hero — Low Impact

> Compact, left-aligned page-title hero for secondary/utility pages. Dark navy background, red accent bar beside the heading, optional breadcrumb, subtitle, and tag pills. No image, no CTA.

## Admin Location
- **Ruta:** `Pages → [page] → Hero → Type → Low Impact`
- **Tipo:** `Hero Variant (field group on Pages collection)`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `type` | select | ✓ | ✗ | Hero variant: `highImpact`, `mediumImpact`, `lowImpact`, `none` |
| `richText` | richText | ✗ | ✓ | Page heading (h1) and optional subtitle paragraph |
| `breadcrumb` | text | ✗ | ✓ | Path label above the heading (e.g. "Home / Case Studies"). Also generates BreadcrumbList JSON-LD. |
| `tags` | array of `{ label }` | ✗ | ✗ | Pill tags rendered below the heading |

## Layout

- **Single column, left-aligned.** Shorter vertical padding than MediumImpact — feels like a page title, not a full hero.
- **Accent bar:** 4px red (`--ak-accent`) vertical bar beside the heading row.
- **Breadcrumb** renders above the heading; when present, a `BreadcrumbList` JSON-LD script is injected.
- **Background:** `var(--ak-header-bg)` — same dark navy as header and MediumImpact.
- **Responsive:** single column, no layout change on mobile.

## JSON-LD

When `breadcrumb` is set, a `BreadcrumbList` schema is injected via `<script type="application/ld+json">`. The breadcrumb string is split on `" / "` to produce `ListItem` entries. `Home` maps to `/`; other labels are slugified. The last item has no `item` URL.

## Quality Checklist

**Completeness: 16/22 (73%)**

### Accessibility AAA
- [x] Contrast ratio minimum 7:1
- [x] All interactive elements keyboard navigable
- [x] ARIA labels on elements without visible text (`aria-label="Page hero"`, `aria-hidden` on accent bar)
- [x] Correct HTML landmarks (`<section>`)
- [x] Focus visible on all interactive elements

### HTML Semantics
- [x] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<section>`, `<ul>` for tags)
- [x] No images — N/A

### Performance
- [x] No images — no next/image needed
- [x] No Cumulative Layout Shift (CLS)
- [x] Off-viewport content lazy loaded — N/A (compact component)

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [x] BreadcrumbList JSON-LD implemented
- [x] Does not block indexing

### Analytics (GA4)
- [ ] GA4 events implemented — no CTAs, no events needed currently

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden
- [x] `--bp-*` base tokens not redeclared inside component
- [x] No DS component markup used — fully custom, no verbatim copy needed
- [x] All customisation via component-level CSS classes — no inline `style=""` attributes
- [x] `--ak-*` tokens used directly (valid for custom project components, not DS components)
- [x] No `.is-active` / `.hidden` state classes — state via ARIA attributes
- [x] Breakpoints use `@media` (this is a full-viewport layout component)
- [ ] Animations respect `prefers-reduced-motion` — no animations currently
- [x] DS grid used correctly: `bp-content-grid` + `breakout` child zone

### Delivery
- [x] Unit tests added (9 tests, all passing)
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [x] Delivery notes written in non-technical language

## Delivery Notes

> The Low Impact Hero is the compact dark banner used on secondary pages like Case Studies, Where It Works, and Why Amerikiosks. To edit it, go to **Pages**, open the page, and scroll to the **Hero** section. Select "Low Impact" from the Type dropdown. Optionally fill in the **Breadcrumb** field (e.g. "Home / Case Studies") — this also adds structured data for search engines. Write your page title as an H1 in the rich text editor, optionally add a subtitle paragraph below it, and add any tag pills. No image or buttons are shown in this hero. Changes are saved as a draft and only go live when you click **Publish**.

# Hero — Medium Impact

> Two-column interior hero with breadcrumb, rich text, CTA links, tag pills, and a rounded right-column image. Used as the above-the-fold section on inner pages (e.g. "For Brands", "For Venues").

## Admin Location
- **Ruta:** `Pages → [page] → Hero → Type → Medium Impact`
- **Tipo:** `Hero Variant (field group on Pages collection)`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `type` | select | ✓ | ✗ | Hero variant: `highImpact`, `mediumImpact`, `lowImpact`, `none` |
| `richText` | richText | ✗ | ✓ | Main headline and supporting text |
| `links` | linkGroup (max 2) | ✗ | ✗ | CTA buttons rendered left-to-right |
| `media` | upload (media) | ✓ | ✗ | Right-column image, displayed with `priority` |
| `breadcrumb` | text | ✗ | ✓ | Path label above the headline (e.g. "Home / Who it's for / For brands") |
| `tags` | array of `{ label }` | ✗ | ✗ | Pill tags rendered below the CTA buttons |

## Layout

- **Desktop:** 50/50 grid — text column left, image column right. Image uses `aspect-ratio: 4/3` with `border-radius`.
- **Mobile (≤60rem):** Single column, text first, image below at `16/9` aspect ratio.
- Background color: `var(--ak-header-bg)` (same dark navy as the site header).

## Quality Checklist

**Completeness: 17/19 (89%)**

### Accessibility AAA
- [x] Contrast ratio minimum 7:1
- [x] All interactive elements keyboard navigable
- [x] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<section>`)
- [x] Focus visible on all interactive elements

### HTML Semantics
- [x] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<section>`, `<ul>` for actions and tags)
- [x] Images have descriptive `alt` text (via `<Media>` component)

### Performance
- [x] Images use `next/image` with correct sizes (`<Media priority>`)
- [x] No Cumulative Layout Shift (CLS)
- [x] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [x] Does not block indexing
- [ ] Schema.org implemented

### Analytics (GA4)
- [x] GA4 events implemented (see section below)

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden
- [x] `--ak-*` tokens used only in custom project component (not a DS component) — compliant
- [x] `--bp-*` base tokens not redeclared
- [ ] Level 2 `--<component>-*` overrides not needed — component is fully custom

### Delivery
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [x] Delivery notes written in non-technical language

## GA4 Analytics

Events fired via global `GAListener` — add `data-ga-*` attributes to the element, no JS needed.

| Event name | Trigger | `data-ga-section` | Required | Implemented |
|------------|---------|-------------------|----------|-------------|
| `hero_cta_click` | User clicks a CTA button | `hero_medium_impact` | ✓ | ✓ |

## Delivery Notes

> The Medium Impact Hero is the two-column banner used on inner pages. To edit it, go to **Pages**, open the page, and scroll to the **Hero** section. Select "Medium Impact" from the Type dropdown. Fill in the **Breadcrumb** field (e.g. "Home / Who it's for / For brands"), write your headline and supporting text in the rich text editor, upload a right-column image, optionally add up to 2 CTA buttons, and add any tag pills (e.g. "Brand-controlled", "Fully managed"). Changes are saved as a draft and only go live when you click **Publish**.

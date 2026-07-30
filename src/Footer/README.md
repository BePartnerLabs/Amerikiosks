# Footer

> Site-wide footer with brand description, navigation columns, and contact information. Appears at the bottom of every page.

## Admin Location
- **Ruta:** `Globals → Footer`
- **Tipo:** `Global`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `brandDescription` | textarea | ✗ | ✓ | Short tagline shown below the logo |
| `columns` | array (max 4) | ✗ | ✗ | Navigation link columns |
| `columns[].label` | text | ✓ | ✓ | Column heading |
| `columns[].links` | array (max 8) | ✗ | ✗ | Links within this column |
| `columns[].links[].link` | link | ✓ | ✗ | Link URL and label |
| `contactHeading` | text | ✗ | ✓ | Contact column heading — empty falls back to the translated default ("Contact" / "Contacto") |
| `contactEmail` | email | ✗ | ✗ | Contact email address |
| `contactCta` | text | ✗ | ✓ | Contact call-to-action label |
| `contactCtaUrl` | text | ✗ | ✓ | Contact CTA URL — localized, per-locale slugs differ |
| `contactCtaType` | select | ✗ | ✗ | Go to a URL, or open a modal form |
| `contactCtaForm` | relationship | ✗ | ✗ | Form opened when the CTA behaviour is modal |

## Variants

| Variante | Descripción |
|----------|-------------|
| Standard | Logo + description + nav columns + contact |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 19/19 (100%)**

### Accessibility AAA
- [x] Contrast ratio minimum 7:1
- [x] All interactive elements keyboard navigable
- [x] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<footer>`)
- [x] Focus visible on all interactive elements

### HTML Semantics
- [x] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<footer>`, `<ul role="list">`)
- [x] Images have descriptive `alt` text

### Performance
- [x] Images use `next/image` with correct sizes
- [x] No Cumulative Layout Shift (CLS)
- [x] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [x] Schema.org implemented
- [x] Does not block indexing

### Analytics (GA4)
- [x] GA4 events implemented (see section below)

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden
- [x] `--bp-*` base tokens not redeclared inside component
- [x] No DS component markup used — fully custom, no verbatim copy needed
- [x] All customisation via component-level CSS classes — no inline `style=""` attributes
- [x] `--ak-*` tokens used directly (valid for custom project components, not DS components)
- [x] No `.is-active` / `.hidden` state classes
- [x] Breakpoints use `@media` (full-viewport layout component — correct)
- [x] No animations — `prefers-reduced-motion` N/A
- [x] DS grid used correctly: `bp-content-grid` + `breakout` child zones

### Delivery
- [x] Unit tests added
- [x] All fields documented in table above
- [x] Screenshots up to date
- [x] Delivery notes written in non-technical language

## GA4 Analytics

Events fired via global `GAListener` — add `data-ga-*` attributes to the element, no JS needed.

**Events:**

| Event name | Trigger | `data-ga-section` | Required | Implemented |
|------------|---------|-------------------|----------|-------------|
| `footer_link_click` | User clicks a nav column link | `footer` | ✓ | ✓ |
| `footer_contact_click` | User clicks the contact CTA or email | `footer` | ✓ | ✓ |

## Schema.org

- **Applicable type:** `WPFooter`
- **Implemented:** ✓
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "WPFooter"
}
```

## Delivery Notes

> The Footer appears at the bottom of every page. You can edit it from **Globals → Footer** in the admin panel. Add a short brand tagline below the logo, up to 4 navigation columns (each with up to 8 links), and a contact section with an email address and a call-to-action button. Changes take effect immediately after saving.

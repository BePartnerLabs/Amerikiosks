# Header

> Site-wide navigation bar with logo, primary nav links, and optional mega menus per item. Appears at the top of every page.

## Admin Location
- **Ruta:** `Globals → Header`
- **Tipo:** `Global`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `navItems` | array | ✗ | ✗ | List of top-level nav links |
| `navItems[].link` | link | ✓ | ✗ | Link URL and label |
| `navItems[].hasMegaMenu` | checkbox | ✗ | ✗ | Enable mega menu for this item |
| `navItems[].megaMenu.panelLabel` | text | ✓ (if mega) | ✓ | Left panel section label (e.g. SOLUTIONS) |
| `navItems[].megaMenu.panelHeadline` | text | ✓ (if mega) | ✓ | Left panel headline |
| `navItems[].megaMenu.panelDescription` | textarea | ✗ | ✓ | Left panel supporting text |
| `navItems[].megaMenu.items` | array | ✗ | ✗ | Right-side grid of mega menu items |

## Variants

| Variante | Descripción |
|----------|-------------|
| Standard | Logo + nav links |
| With mega menu | Nav item expands to full-width panel |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 11/21 (52%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [x] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<header>`, `<nav>`)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<header>`, `<nav>`, `<ul>`)
- [x] Images have descriptive `alt` text

### Performance
- [x] Images use `next/image` with correct sizes
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [x] Schema.org implemented
- [x] Does not block indexing

### Delivery
- [ ] Unit tests added
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

### Analytics (GA4)
- [x] GA4 events implemented (see section below)

## Schema.org

- **Applicable type:** `SiteNavigationElement`
- **Implemented:** ✓
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Main Navigation"
}
```

## GA4 Analytics

Events fired via global `GAListener` — add `data-ga-*` attributes to the element, no JS needed.

**Events:**

| Event name | Trigger | `data-ga-section` | Required | Implemented |
|------------|---------|-------------------|----------|-------------|
| `navigation_click` | User clicks a nav link | `header` | ✓ | ✓ |
| `mobile_menu_open` | User opens the mobile menu | `header` | ✗ | ✗ |
| `cta_click` | User clicks the header CTA button | `header` | ✗ | ✗ |

## Delivery Notes

> The Header appears at the top of every page of your site. You can add, remove, or reorder navigation links from the admin panel under **Globals → Header**. For each link, you can optionally enable a "mega menu" — a large dropdown panel with a title, description, and a grid of sub-links. Changes to the header take effect immediately after saving.

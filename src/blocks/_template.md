# [Block Name]

> [One sentence: what this block does and when to use it.]

## Admin Location
- **Ruta:** `[e.g. Globals → Header / Pages → [page] → Layout → [Block Name]]`
- **Tipo:** `[Global / Layout Block / Lexical Block]`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `fieldName` | text | ✓ | ✗ | Description of the field |

## Variants

| Variante | Descripción |
|----------|-------------|
| `default` | Standard appearance |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/21 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [ ] Correct HTML landmarks (`header`, `main`, `nav`, `section`, etc.)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [ ] Semantic elements used (not `div` soup)
- [ ] Images have descriptive `alt` text

### Performance
- [ ] Images use `next/image` with correct sizes
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [ ] Schema.org implemented (see section below)
- [ ] Does not block indexing

### Analytics (GA4)
- [ ] GA4 events implemented (see section below)

### Design System (BPL DS) CSS
- [ ] No `--_*` private DS variables used or overridden
- [ ] `--bp-*` base tokens not redeclared inside components
- [ ] DS component markup copied verbatim from `ds.bepartnerlabs.com/components/<name>/` (if using a DS component)
- [ ] All DS component customisation via `--<component>-*` class variables only — no source CSS modifications
- [ ] `--ak-*` brand tokens not used directly in DS component CSS properties (use `--<component>-*` Level 2 overrides instead)
- [ ] Custom project components (non-DS markup) may use `--ak-*` and `--bp-*` tokens directly
- [ ] No inline `style=""` attributes
- [ ] State expressed via ARIA attributes / native pseudo-classes — not `.is-active`, `.active`, `.hidden` style classes
- [ ] Component breakpoints use `@container`; full-viewport layouts (hero, header, footer) use `@media`
- [ ] Animations respect `prefers-reduced-motion`
- [ ] DS grid used correctly: content in `bp-content-grid` direct children with zone class (`breakout`, `popout`, `full-width`); no custom `max-width` containers duplicating grid behaviour

### Delivery
- [ ] Unit tests added
- [ ] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## GA4 Analytics

Events are fired automatically by the global `GAListener` when it detects a click on an element with `data-ga-event`. No JS needed in the component — just add the attributes.

```html
<element
  data-ga-event="[event_name]"
  data-ga-section="[block_name]"
  data-ga-label="[optional — innerText used as fallback]"
>
```

**Events:**

| Event name | Trigger | `data-ga-section` | Required | Implemented |
|------------|---------|-------------------|----------|-------------|
| `[event_name]` | [when it fires] | `[block_name]` | ✓ | ✗ |
| `[event_name_2]` | [optional extended tracking] | `[block_name]` | ✗ | ✗ |

## Schema.org

- **Applicable type:** `[e.g. WebPageElement, SiteNavigationElement, Article]`
- **Implemented:** ✗
- **Snippet:**

```json
{}
```

## Delivery Notes

> [Non-technical instructions for the client: how to edit this block, what each field does in plain language, any important content guidelines.]

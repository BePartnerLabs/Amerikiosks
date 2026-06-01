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

### Delivery
- [ ] Unit tests added
- [ ] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## GA4 Analytics

- **Implemented:** ✗
- **Events:**

| Event name | Trigger | Parameters |
|------------|---------|------------|
| `[event_name]` | [when it fires] | `{ param: value }` |

- **Markup:** Add `data-ga-*` attributes to trackable elements — the global `GAListener` fires the event automatically:

```html
<element
  data-ga-event="[event_name]"
  data-ga-section="[block_name]"
  data-ga-label="[optional explicit label, or innerText is used as fallback]"
>
```

- **Fired event:**

```js
gtag('event', '[event_name]', {
  section: '[block_name]',
  label: '[label or innerText]',
})
```

## Schema.org

- **Applicable type:** `[e.g. WebPageElement, SiteNavigationElement, Article]`
- **Implemented:** ✗
- **Snippet:**

```json
{}
```

## Delivery Notes

> [Non-technical instructions for the client: how to edit this block, what each field does in plain language, any important content guidelines.]

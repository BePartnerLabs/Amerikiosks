# Metrics

> Displays a heading with a row of 2-6 key stats (animated number + label) and an optional CTA button. Use it to show credibility numbers ("10+ years", "1000+ active kiosks") on the home page or any layout page.

## Admin Location
- **Ruta:** `Pages → [page] → Layout → Metrics`
- **Tipo:** `Layout Block` (also insertable inside a `Content` block's rich text via the block toolbar)

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `eyebrow` | text | ✗ | ✓ | Small label above the heading |
| `heading` | textarea | ✓ | ✓ | Main heading. Supports `**bold**` markdown |
| `items` | array (2-6) | ✓ | ✓ | Each stat: `value` (e.g. "10+") and `label` |
| `link` | group | ✗ | — | Optional CTA button: `label`, `url`, `type` (custom/reference), `reference` |

## Behavior

- Numbers animate (count-up) once the block scrolls into view. Values with 3+ digits (e.g. "1000+") start the count from 60% of the target instead of 0, so the animation reads quickly.
- Stats fade/rise into place with a staggered delay on scroll, using native CSS scroll-driven animations — this is a progressive enhancement; browsers without support (older Safari/Firefox) simply show the stats statically.
- All animation respects `prefers-reduced-motion: reduce` — values render immediately with no motion.
- Mobile switches the stats row to a 2×2 grid.

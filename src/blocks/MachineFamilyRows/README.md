# Machine Family Rows / Familias en Filas

> Todas las familias de máquinas, una fila compacta cada una: imagen, cantidad de
> modelos, la característica destacada y un link a la familia. Reemplaza las cinco
> secciones `machineFamily` que la página `/machines` apilaba.

## Admin Location
- **Ruta:** `Pages → machines → Layout → Familias en Filas`
- **Tipo:** `Layout Block`

**No recibe una familia.** Siempre las muestra todas, ordenadas por nombre. Elegir
un subconjunto sería navegación disfrazada de contenido — el error que el selector
de familias cometía antes de que `machineFamily` lo quitara.

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `eyebrow` | text | ✗ | ✓ | Etiqueta chica sobre el título |
| `heading` | text | ✓ | ✓ | Título de la sección |
| `intro` | textarea | ✗ | ✓ | Una o dos líneas bajo el título |
| `countEyebrow` | text | ✗ | ✓ | Acompaña al número de modelos. Default `models in line` |
| `ctaLabel` | text | ✗ | ✓ | Se usa si la familia no trae etiqueta propia. Default `View the line` |
| `soonLabel` | text | ✗ | ✓ | Reemplaza al conteo cuando la familia no tiene modelos. Default `Coming soon` |
| `soonCtaLabel` | text | ✗ | ✓ | Link de una familia sin modelos. Default `Explore the line` |

**Nada de contenido de la familia se escribe acá.** Nombre, tagline, thumbnail,
características y conteo salen de la colección `machine-families`.

**El número de modelos se cuenta, no se tipea.** Sale de la colección `machines`,
así que no puede quedar desactualizado.

## Variants

No tiene variantes configurables. Cada fila toma uno de dos estados, **derivado**
del contenido:

| Estado | Cuándo | Qué muestra |
|--------|--------|-------------|
| `normal` | La familia tiene al menos un modelo publicado | `N models in line` y el CTA normal |
| `soon` | La familia no tiene modelos publicados | `soonLabel` en color apagado y `soonCtaLabel` |

El estado `soon` **se apaga solo** el día que se publica el primer modelo de esa
familia. Nadie tiene que entrar a sacar un cartel.

Sigue siendo un link en los dos casos: la página de una familia sin modelos no está
vacía — tiene su hero y sus características, y los dos componentes que quedarían
huecos (`SpecsCompare`, `ModelsCarousel`) ya retornan `null` solos. Lo único que el
CTA no puede hacer es prometer modelos.

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/30 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [ ] Correct HTML landmarks (`header`, `main`, `nav`, `section`, etc.) — the `<section>` on a registered block is enforced by `scripts/validate-block-markup.mjs`
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
- [ ] The DS's own `--_*` privates are not read or overridden. (Your block's own `--_name-*` slots are the *approved* channel — `validate-ds-tokens.mjs` requires them.)
- [ ] `--bp-*` base tokens not redeclared inside components
- [ ] DS component markup copied verbatim from `ds.bepartnerlabs.com/components/<name>/` (if using a DS component)
- [ ] All DS component customisation via `--<component>-*` class variables only — no source CSS modifications
- [ ] `--ak-*` brand tokens not used directly in DS component CSS properties (use `--<component>-*` Level 2 overrides instead)
- [ ] Custom project components (non-DS markup) may use `--ak-*` and `--bp-*` tokens directly
- [ ] No inline `style=""` carrying CSS declarations. (Setting a **custom property** inline — `style={{ '--x': progress }}` — is allowed and often the only way to get runtime values into CSS.)
- [ ] State expressed via ARIA attributes / native pseudo-classes — not `.is-active`, `.active`, `.hidden` style classes
- [ ] Component breakpoints use `@container`; full-viewport layouts (hero, header, footer) use `@media`. Tick it if the block needs no breakpoints at all — sizing with `clamp()`/`min()` is better than either.
- [ ] Animations respect `prefers-reduced-motion`
- [ ] DS grid used correctly: content in `bp-content-grid` direct children with zone class (`breakout`, `popout`, `full-width`); no custom `max-width` containers duplicating grid behaviour — the presence of `bp-content-grid`, like `<section>` and `data-ga-block`, is enforced by `scripts/validate-block-markup.mjs` (pre-commit)

### Delivery
- [ ] Unit tests added
- [ ] All fields documented in table above
- [ ] Screenshots up to date — **only when the block is marked finished for client delivery.** Leave unticked while it is still moving; see `docs/business/definition-of-done.md`.
- [ ] Delivery notes written in non-technical language

## GA4 Analytics

Events are fired automatically by the global `GAListener` when it detects a click on an element with `data-ga-event`. No JS needed in the component — just add the attributes.

```html
<element
  data-ga-event="[event_name]"
  data-ga-block="[blockType]"     // → the `block` param
  data-ga-section="[blockName]"    // → the `section` param, optional
  data-ga-label="[optional — innerText used as fallback]"
>
```

**Events:**

| Event name | Trigger | `data-ga-block` | Required | Implemented |
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

## Production setup

> What someone has to **do in `/admin` on production** for this block to appear.
> Shipping the code is not shipping the feature: a block nobody adds to a page
> renders nowhere, and this is the step that gets forgotten between merge and
> "why isn't it live?".
>
> Delete this section only if the block genuinely needs nothing — and say so.

- [ ] **Content to create.** e.g. "a `pages` document with slug `machines` /
      `maquinas`, in **both locales in the same session**" (see the localized-array
      gotcha in `docs/patterns/`), or "one `machine-families` document per line".
- [ ] **Where to add the block**, in order, and next to what.
- [ ] **Fields that must be filled** for it to render at all, versus the ones
      that are optional. State what happens if a required one is empty.
- [ ] **Media needed**, with dimensions and background — e.g. "cut-out PNG on
      transparency, portrait ~4:5; it renders on navy and a white machine on a
      light background disappears."
- [ ] **Anything that is NOT automatic.** If adding a new family means also
      adding its block by hand, say it here — that is exactly the kind of thing
      that silently does not happen.
- [ ] **Order of operations**, if it matters. Migration before content, or
      content before the route is switched over.

## Delivery Notes

> [Non-technical instructions for the client: how to edit this block, what each
> field does in plain language, any important content guidelines. This is the
> raw material for `docs/CLIENT-MANUAL.md` — write it as if the reader has never
> seen the repo.]

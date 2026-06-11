# Micro Interactions — Design Spec
Date: 2026-06-10

## Goal

Add subtle, professional micro interactions across all interactive blocks. Standardize motion tokens, expand coverage to blocks that have none, and ensure all motion respects `prefers-reduced-motion`.

## Motion Tokens

Add to `src/app/(frontend)/tokens.css`:

```css
--ak-transition-fast: 150ms ease;
--ak-transition-med:  200ms ease;
--ak-shadow-lift:     0 4px 16px hsla(213, 96%, 11%, 0.12);
--ak-shadow-lift-md:  0 8px 24px hsla(213, 96%, 11%, 0.16);
```

All block interactions reference these tokens. No block hard-codes timing or shadow values.

## `prefers-reduced-motion` Strategy

Wrap all `transform` and `transition` rules that involve movement in:

```css
@media (prefers-reduced-motion: no-preference) {
  /* transform + transition rules here */
}
```

Opacity-only transitions are safe (non-vestibular) and may remain unconditional. Follow the pattern already established in `TrustStrip/styles.css`.

## Per-Block Changes

### CardGrid (`src/blocks/CardGrid/styles.css`)

- Move `transition` from the `:hover` selector to `.ak-card-grid__card` so it applies in both directions (enter + leave).
- Add `translateY(-2px)` to `.ak-card-grid__card--linked:hover`.
- Add `translateX(3px)` to `.ak-card-grid__card-link-arrow` on card hover.
- Use `--ak-transition-fast` and `--ak-shadow-lift` tokens.
- Wrap all transform/transition rules in `prefers-reduced-motion: no-preference`.

### AudienceShowcase (`src/blocks/AudienceShowcase/styles.css`)

- Image scale already present — leave it.
- Add `translateY(-3px)` lift to `.ak-audience-showcase__card` on hover.
- Add `opacity` + `border-color` transition to `.ak-audience-showcase__card-cta` on card hover.
- Use `--ak-transition-fast` token.
- Wrap transforms in `prefers-reduced-motion: no-preference`.

### InsightsShowcase (`src/blocks/InsightsShowcase/styles.css`)

- Add `scale(1.04)` to featured image on `.ak-insights-showcase__featured:hover .ak-insights-showcase__featured-img`.
- Add `translateY(-2px)` + `--ak-shadow-lift` to `.bp-card` on hover.
- Add `translateX(3px)` to `.ak-insights-showcase__link-arrow` on link hover.
- Use `--ak-transition-fast` token.
- Wrap transforms in `prefers-reduced-motion: no-preference`.

### CallToAction (`src/blocks/CallToAction/styles.css`)

- Add `transition: background-color var(--ak-transition-fast), color var(--ak-transition-fast)` to `.ak-cta__actions a, .ak-cta__actions button`.
- Currently the fill is instant — this makes it smooth.

### Code (`src/blocks/Code/styles.css`)

- Add `transition: opacity var(--ak-transition-fast), transform var(--ak-transition-fast)` to the copy button.
- On `:active`: `opacity: 0.7` + `scale(0.95)` for tactile press feedback.
- Wrap transform in `prefers-reduced-motion: no-preference`.

### HighImpact Hero (`src/heros/HighImpact/high-impact.css`)

Staggered fade-up entrance on `.ak-hero-home__content > *`. Pure CSS `@keyframes`, no JS.

Keyframe:
```css
@keyframes ak-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Applied to children with staggered delays:
- `h1, h2` — `500ms ease-out`, delay `0ms`
- `p` — `500ms ease-out`, delay `150ms`
- `.ak-hero-home__actions` — `500ms ease-out`, delay `300ms`

Use `animation-fill-mode: both` so elements start invisible before the animation fires.
Wrap in `prefers-reduced-motion: no-preference`.

### MediumImpact Hero (`src/heros/MediumImpact/medium-impact.css`)

Same `ak-fade-up` keyframe (defined once, shared via tokens or redeclared) applied to `.ak-hero-interior__text > *`:
- `richText` wrapper / `h1, h2` — delay `0ms`
- `p` — delay `150ms`
- `.ak-hero-interior__actions` — delay `300ms`

Wrap in `prefers-reduced-motion: no-preference`.

### Blocks with no changes

| Block | Reason |
|---|---|
| Banner | Static content, no interactive elements |
| Content | No interactive elements |
| MediaBlock | No interactive elements |
| TrustStrip | Already has pause-on-hover + `prefers-reduced-motion` — leave as-is |

## Files Changed

- `src/app/(frontend)/tokens.css` — add 4 motion tokens
- `src/blocks/CardGrid/styles.css`
- `src/blocks/AudienceShowcase/styles.css`
- `src/blocks/InsightsShowcase/styles.css`
- `src/blocks/CallToAction/styles.css`
- `src/blocks/Code/styles.css`
- `src/heros/HighImpact/high-impact.css`
- `src/heros/MediumImpact/medium-impact.css`

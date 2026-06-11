# Micro Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle, professional micro interactions across all interactive blocks and hero variants, standardized via CSS motion tokens, with full `prefers-reduced-motion` support.

**Architecture:** Pure CSS changes only — no new JS or React components. Motion tokens land in `tokens.css` first; each block's `styles.css` (and hero CSS files) reference them. All transform/transition rules are wrapped in `@media (prefers-reduced-motion: no-preference)`. Opacity-only transitions are unconditional (safe).

**Tech Stack:** CSS custom properties, `@keyframes`, `@media (prefers-reduced-motion)`, TailwindCSS v4 (not used here — these are BPL DS `.ak-*` classes).

**Spec:** `docs/superpowers/specs/2026-06-10-micro-interactions-design.md`

---

### Task 1: Motion tokens + shared keyframe

**Files:**
- Modify: `src/app/(frontend)/tokens.css`

- [ ] **Step 1: Add motion tokens and `ak-fade-up` keyframe to `:root`**

Open `src/app/(frontend)/tokens.css`. Find the `:root` block and append:

```css
  /* Motion */
  --ak-transition-fast: 150ms ease;
  --ak-transition-med:  200ms ease;
  --ak-shadow-lift:     0 4px 16px hsla(213, 96%, 11%, 0.12);
  --ak-shadow-lift-md:  0 8px 24px hsla(213, 96%, 11%, 0.16);
```

Then, **outside** the `:root` block (at file level), add:

```css
@keyframes ak-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Verify tokens are reachable**

Run `pnpm dev` and open any page in the browser. In DevTools console run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--ak-transition-fast')
```

Expected: `" 150ms ease"` (with leading space is fine).

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/tokens.css
git commit -m "feat(tokens): add motion tokens and ak-fade-up keyframe"
```

---

### Task 2: CardGrid micro interactions

**Files:**
- Modify: `src/blocks/CardGrid/styles.css`

Current state: `.ak-card-grid__card--linked:hover` has `box-shadow` and `transition` only on the hover rule (one-direction only). Arrow has no transition.

- [ ] **Step 1: Fix card transition and add lift + arrow slide**

In `src/blocks/CardGrid/styles.css`, replace the existing linked-card hover block:

```css
/* Before — remove this: */
.ak-card-grid__card--linked:hover {
  box-shadow: var(--ak-card-shadow-md);
  transition: box-shadow 0.15s ease;
}
```

With:

```css
@media (prefers-reduced-motion: no-preference) {
  .ak-card-grid__card--linked {
    transition:
      box-shadow var(--ak-transition-fast),
      transform var(--ak-transition-fast);
  }

  .ak-card-grid__card--linked:hover {
    box-shadow: var(--ak-shadow-lift);
    transform: translateY(-2px);
  }

  .ak-card-grid__card-link-arrow {
    transition: transform var(--ak-transition-fast);
  }

  .ak-card-grid__card--linked:hover .ak-card-grid__card-link-arrow {
    transform: translateX(3px);
  }
}
```

- [ ] **Step 2: Visual check**

With `pnpm dev` running, open a page with a CardGrid block. Hover a linked card — it should lift 2px and cast a subtle shadow. The arrow icon should slide 3px right. Both should animate in and out smoothly.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/CardGrid/styles.css
git commit -m "feat(card-grid): add lift and arrow slide micro interactions"
```

---

### Task 3: AudienceShowcase micro interactions

**Files:**
- Modify: `src/blocks/AudienceShowcase/styles.css`

Current state: image scale exists but is not wrapped in `prefers-reduced-motion`. Card has no lift. CTA has no hover state.

- [ ] **Step 1: Wrap existing image scale and add card lift + CTA hover**

In `src/blocks/AudienceShowcase/styles.css`, replace:

```css
/* Before — remove these two rules: */
.ak-audience-showcase__card-img {
  object-fit: cover;
  transition: transform 0.35s ease;
}

.ak-audience-showcase__card:hover .ak-audience-showcase__card-img {
  transform: scale(1.04);
}
```

With:

```css
.ak-audience-showcase__card-img {
  object-fit: cover;
}

@media (prefers-reduced-motion: no-preference) {
  .ak-audience-showcase__card {
    transition: transform var(--ak-transition-fast);
  }

  .ak-audience-showcase__card:hover {
    transform: translateY(-3px);
  }

  .ak-audience-showcase__card-img {
    transition: transform 0.35s ease;
  }

  .ak-audience-showcase__card:hover .ak-audience-showcase__card-img {
    transform: scale(1.04);
  }

  .ak-audience-showcase__card-cta {
    transition: opacity var(--ak-transition-fast), border-color var(--ak-transition-fast);
  }

  .ak-audience-showcase__card:hover .ak-audience-showcase__card-cta {
    opacity: 0.85;
    border-color: rgba(255, 255, 255, 0.5);
  }
}
```

- [ ] **Step 2: Visual check**

Open a page with an AudienceShowcase block. Hover a card — it should lift 3px, the background image should subtly zoom, and the CTA border should soften. Everything animates in and out.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/AudienceShowcase/styles.css
git commit -m "feat(audience-showcase): wrap image scale in prefers-reduced-motion, add card lift and CTA hover"
```

---

### Task 4: InsightsShowcase micro interactions

**Files:**
- Modify: `src/blocks/InsightsShowcase/styles.css`

Current state: link hover has only `opacity: 0.75` (no transition). No card lift. No featured image scale.

- [ ] **Step 1: Add featured image scale, card lift, and arrow slide**

In `src/blocks/InsightsShowcase/styles.css`, replace:

```css
/* Before — remove: */
.ak-insights-showcase__link:hover {
  opacity: 0.75;
}
```

With:

```css
.ak-insights-showcase__link:hover {
  opacity: 0.75;
}

@media (prefers-reduced-motion: no-preference) {
  /* Featured image zoom */
  .ak-insights-showcase__featured-img-wrap img {
    transition: transform var(--ak-transition-med);
  }

  .ak-insights-showcase__featured:hover .ak-insights-showcase__featured-img-wrap img {
    transform: scale(1.04);
  }

  /* Secondary card lift */
  .ak-insights-showcase__cards .bp-card {
    transition:
      box-shadow var(--ak-transition-fast),
      transform var(--ak-transition-fast);
  }

  .ak-insights-showcase__cards .bp-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--ak-shadow-lift);
  }

  /* Link arrow slide */
  .ak-insights-showcase__link-arrow {
    transition: transform var(--ak-transition-fast);
  }

  .ak-insights-showcase__link:hover .ak-insights-showcase__link-arrow {
    transform: translateX(3px);
  }
}
```

- [ ] **Step 2: Visual check**

Open a page with an InsightsShowcase block. Hover the featured image — it should subtly zoom. Hover a secondary card — it should lift with shadow. Hover a "know more" link — the arrow should slide right.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/InsightsShowcase/styles.css
git commit -m "feat(insights-showcase): add featured image zoom, card lift, and arrow slide"
```

---

### Task 5: CallToAction button transition

**Files:**
- Modify: `src/blocks/CallToAction/styles.css`

Current state: button hover fills with `background-color: currentColor` instantly (no transition).

- [ ] **Step 1: Add transition to CTA button**

In `src/blocks/CallToAction/styles.css`, find `.ak-cta__actions a, .ak-cta__actions button` and add a `transition` property:

```css
.ak-cta__actions a,
.ak-cta__actions button {
  --btn-background: var(--brand-color-palette-white) !important;
  --btn-color: var(--ak-cta-btn-color) !important;
  background-color: var(--brand-color-palette-white) !important;
  color: var(--ak-cta-btn-color) !important;
  transition: background-color var(--ak-transition-fast), color var(--ak-transition-fast);
}
```

(Opacity/color transitions are safe — no `prefers-reduced-motion` wrapper needed.)

- [ ] **Step 2: Visual check**

Open a page with a CallToAction block. Hover a button — the background fill should animate in smoothly over ~150ms instead of snapping.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/CallToAction/styles.css
git commit -m "feat(cta): smooth button hover fill transition"
```

---

### Task 6: Code copy button press feedback

**Files:**
- Modify: `src/blocks/Code/styles.css`

Current state: no transition or press feedback on the copy button.

- [ ] **Step 1: Add press feedback to copy button**

In `src/blocks/Code/styles.css`, append after the existing `.ak-code__copy` rule:

```css
@media (prefers-reduced-motion: no-preference) {
  .ak-code__copy button {
    transition:
      opacity var(--ak-transition-fast),
      transform var(--ak-transition-fast);
  }

  .ak-code__copy button:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}
```

- [ ] **Step 2: Visual check**

Open a page with a Code block. Click the copy button — it should briefly dip in opacity and scale down slightly on press, then spring back.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Code/styles.css
git commit -m "feat(code): add press feedback to copy button"
```

---

### Task 7: HighImpact hero entrance animation

**Files:**
- Modify: `src/heros/HighImpact/high-impact.css`

The `ak-fade-up` keyframe is already defined globally in `tokens.css` (Task 1). Reference it here.

- [ ] **Step 1: Add staggered entrance to hero content children**

In `src/heros/HighImpact/high-impact.css`, append before the `@media (max-width: 36rem)` block:

```css
@media (prefers-reduced-motion: no-preference) {
  .ak-hero-home__content > * {
    animation: ak-fade-up 500ms ease-out both;
  }

  .ak-hero-home__content > *:nth-child(2) {
    animation-delay: 150ms;
  }

  .ak-hero-home__content > *:nth-child(3) {
    animation-delay: 300ms;
  }

  .ak-hero-home__content > *:nth-child(n + 4) {
    animation-delay: 450ms;
  }
}
```

`animation-fill-mode: both` (via the `both` shorthand) keeps elements invisible before their animation fires and frozen after it completes.

- [ ] **Step 2: Visual check**

Navigate to the home page (which uses the HighImpact hero). The heading, paragraph, and CTA buttons should fade up one after another on page load. Refresh a few times to confirm timing feels right.

- [ ] **Step 3: Commit**

```bash
git add src/heros/HighImpact/high-impact.css
git commit -m "feat(hero-high-impact): add staggered fade-up entrance animation"
```

---

### Task 8: MediumImpact hero entrance animation

**Files:**
- Modify: `src/heros/MediumImpact/medium-impact.css`

Same pattern as Task 7, applied to the interior hero's text column.

- [ ] **Step 1: Add staggered entrance to interior hero text children**

In `src/heros/MediumImpact/medium-impact.css`, append before the `@media (max-width: 60rem)` block:

```css
@media (prefers-reduced-motion: no-preference) {
  .ak-hero-interior__text > * {
    animation: ak-fade-up 500ms ease-out both;
  }

  .ak-hero-interior__text > *:nth-child(2) {
    animation-delay: 150ms;
  }

  .ak-hero-interior__text > *:nth-child(3) {
    animation-delay: 300ms;
  }

  .ak-hero-interior__text > *:nth-child(n + 4) {
    animation-delay: 450ms;
  }
}
```

- [ ] **Step 2: Visual check**

Navigate to an interior page that uses the MediumImpact hero. The breadcrumb, heading, paragraph, and actions should stagger in on load.

- [ ] **Step 3: Commit**

```bash
git add src/heros/MediumImpact/medium-impact.css
git commit -m "feat(hero-medium-impact): add staggered fade-up entrance animation"
```

---

### Task 9: Final cross-block review

- [ ] **Step 1: Run the full test suite**

```bash
pnpm test:int
```

Expected: all tests pass (CSS changes don't affect integration tests).

- [ ] **Step 2: Check all blocks in the browser**

With `pnpm dev` running, visually verify each block:

| Block | What to check |
|---|---|
| CardGrid (all variants) | Card lift + arrow slide on hover |
| AudienceShowcase | Card lift + image zoom + CTA fade on hover |
| InsightsShowcase | Featured image zoom + card lift + arrow slide |
| CallToAction | Smooth button fill on hover |
| Code | Copy button press feedback |
| HighImpact hero | Staggered fade-up on page load |
| MediumImpact hero | Staggered fade-up on page load |

- [ ] **Step 3: Test `prefers-reduced-motion`**

In Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Verify: all transforms and animations stop. Opacity-only hovers (InsightsShowcase link) still work.

- [ ] **Step 4: Commit check**

```bash
git log --oneline -8
```

Expected: one commit per task (Tasks 1–8) in sequence.

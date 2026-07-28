# Accessibility Widget (ADA button) — Design

**Date:** 2026-07-27
**Status:** Approved, pending implementation plan

## Problem

The site has no user-facing accessibility affordance. The client asked for an "ADA
accessibility button" — the familiar floating button that opens a panel of display
preferences.

## Scope caveat (stated explicitly)

An accessibility widget is **not** ADA/WCAG compliance. It is a convenience layer.
Conformance comes from the underlying markup being keyboard-navigable, properly
labelled, and sufficiently contrasted. The current base is reasonable (skip link,
semantic `<main>`, rem-based DS tokens), but a real WCAG 2.1 AA audit is a separate
follow-up and is **not** covered by this design.

Third-party overlays (accessiBe, UserWay) were considered and rejected: paid
subscription, external script (CSP + performance cost), and overlays have themselves
been the subject of ADA litigation. We build in-house.

## Decisions

| Decision | Choice |
|---|---|
| Implementation | Custom in-house toolbar, no vendor script |
| Placement | Floating FAB, bottom-left, stacked **above** the existing cookie-consent reopen FAB |
| Persistence | `localStorage` only — no cookie, no Payload schema change, no migration |
| Read-aloud | Native `window.speechSynthesis` — no API key, no cost |
| Localization | `next-intl`, `accessibility` namespace, en + es |

### Placement collision

`.ak-consent-reopen-btn` (`src/components/ConsentBanner/styles.css:192`) is already a
fixed FAB at `inset-inline-start: var(--bp-space-4)` / `bottom: var(--bp-space-4)`.
The accessibility FAB occupies the slot directly above it in the same bottom-left
column. Both must account for `env(safe-area-inset-bottom)` — the consent card already
documents why (mobile Safari collapsible toolbar overlaps `position: fixed` elements
anchored by `bottom`).

## Architecture

```
src/components/AccessibilityWidget/
  index.tsx          'use client' — FAB + panel, mounted once in the locale layout
  useA11yPrefs.ts    prefs state; reads/writes localStorage; writes <html> attributes
  readAloud.ts       SpeechSynthesis controller (start/stop/cancel, voice selection)
  styles.css         widget chrome only (FAB, panel, controls)

src/app/(frontend)/frontend.css   site-wide effect overrides keyed off <html> attrs
src/messages/{en,es}.json         `accessibility` namespace
src/app/(frontend)/[locale]/layout.tsx   mount + pre-paint restore script
```

### Data flow

The widget never touches other components. It writes state to
`document.documentElement`, and every visual effect is plain CSS keyed off that:

| Preference | Written to `<html>` |
|---|---|
| Text size | `style="--ak-a11y-text-scale: 1 \| 1.15 \| 1.3"` |
| High contrast | `data-a11y-contrast="on"` |
| Highlight links | `data-a11y-links="on"` |
| Reduce motion | `data-a11y-motion="reduce"` |

`html { font-size: calc(100% * var(--ak-a11y-text-scale, 1)); }`

Prefs are serialized to `localStorage` under `ak-a11y-prefs` as a single JSON object.
A small blocking inline script in `<head>` (same pattern as theme scripts) replays the
stored prefs onto `<html>` before first paint, so settings do not flash off on reload.
The script is defensive: any parse error falls through to defaults silently.

### Controls

1. **Text size** — three steps: 100% / 115% / 130%. Safe because the design system is
   rem-based. Implemented as a 3-way segmented control, not an unbounded +/-.
2. **High contrast** — a scoped override block under `[data-a11y-contrast="on"]`:
   near-black/white text, solid visible borders, muted grays raised to full text color,
   forced background behind text-over-image heroes.
3. **Highlight links** — underline plus outline on every `a` and `button` under
   `[data-a11y-links="on"]`.
4. **Reduce motion** — under `[data-a11y-motion="reduce"]`, transitions/animations are
   disabled site-wide. Complements the OS `prefers-reduced-motion` media query for users
   who cannot change the OS setting (shared/kiosk machines).
5. **Read aloud** — toggle. When ON, clicking any text block
   (`p, h1–h6, li, blockquote, a, button`) inside `#main-content` speaks its
   `textContent`. Utterance language derives from `<html lang>` (`en-US` / `es-ES`),
   picking the first matching installed voice. Speech is cancelled by: clicking the same
   element again, pressing Esc, the panel's Stop button, toggling the control off, or a
   client-side route change. The control is feature-detected and **hidden entirely** when
   `!('speechSynthesis' in window)` — Firefox/Linux support is unreliable.

### The widget's own accessibility

Non-negotiable, since the widget failing a11y would be self-defeating:

- FAB: `aria-expanded`, `aria-controls`, descriptive `aria-label`, visible focus ring.
- Panel: `role="dialog"` with `aria-labelledby`; focus moves to the first control on
  open and returns to the FAB on close; Esc closes.
- Each toggle is a real `<button>` with `aria-pressed`; the text-size group is a radio
  group with arrow-key navigation.
- State changes announced through a polite `aria-live` region.
- Fully operable by keyboard alone; no pointer-only interaction.

## Error handling

- `localStorage` unavailable or throwing (private mode, blocked storage): prefs work for
  the session in memory, persistence silently skipped. Never throws to the user.
- Corrupt stored JSON: discarded, defaults applied.
- `speechSynthesis` present but no voice matches the locale: falls back to the browser
  default voice rather than failing silently.

## Testing

- **Vitest (unit):** prefs serialize/deserialize round-trip, defaulting on corrupt input,
  and the attribute-application function producing the expected `<html>` state for each
  pref combination.
- **Playwright (e2e):** open the panel, toggle each control, assert the corresponding
  `<html>` attribute, reload, assert the prefs survived. Assert the FAB does not overlap
  the consent reopen FAB.

Per standing preference, no test/lint run happens without asking first.

## Out of scope

- Dyslexia-friendly font toggle
- Vendor overlay scripts
- An `/accessibility` statement page (worth adding later; separate spec)
- A full WCAG 2.1 AA audit and remediation of existing pages
- CMS-configurable widget settings (no Payload change at all)

## Client manual

`docs/CLIENT-MANUAL.md` gets a bullet: the accessibility widget is always-on site-wide,
requires no admin configuration, and its labels are translated via the site's message
files, not the CMS.

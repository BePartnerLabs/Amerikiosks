# Accessibility Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating accessibility button that opens a panel with text-size, high-contrast, link-highlight, reduce-motion, and native read-aloud controls, persisted per browser.

**Architecture:** A single client component mounted once in the locale layout. It never touches other components — it writes preferences onto `<html>` as data attributes plus one CSS custom property, and every visual effect is plain CSS keyed off those attributes. Preferences live in `localStorage` and are replayed by a tiny blocking script in `<head>` before first paint.

**Tech Stack:** Next.js 16 App Router, React client components, `next-intl`, plain CSS (BPL DS tokens), Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-27-accessibility-widget-design.md`

## Global Constraints

- No Payload schema change, no migration, no CMS configuration. This feature is code-only.
- No new npm dependencies. Read-aloud uses the native `window.speechSynthesis` API.
- Persistence is `localStorage` only, under the key `ak-a11y-prefs`. No cookies.
- Every user-visible string goes through `next-intl` under the `accessibility` namespace, with both `en` and `es` translations. No hardcoded English in JSX.
- CSS follows the project's 3-level variable rule: consume `--bp-*` DS tokens, declare Level-2 `--a11y-*` overrides only where a DS default does not fit, never touch `--_*`.
- Commit subjects must start lowercase (commitlint `subject-case`). `feat: accessibility widget` passes, `feat: Accessibility widget` fails.
- The husky `commit-msg`/pre-commit hook runs the full Vitest suite on every commit. Commits take ~60s. This is expected, not a hang.
- Biome is the linter/formatter. Single quotes, no semicolons, 2-space indent — match surrounding files.
- The accessibility FAB must not overlap `.ak-consent-reopen-btn`, the existing cookie FAB fixed at bottom-left (`src/components/ConsentBanner/styles.css:192`).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/utilities/a11yPrefs.ts` | Pure prefs logic: types, defaults, parse/serialize, safe storage access, apply-to-element, and the pre-paint restore script string. No React. |
| `src/components/AccessibilityWidget/useA11yPrefs.ts` | React hook wrapping the utility: state, hydration, persistence side effects. |
| `src/components/AccessibilityWidget/readAloud.ts` | SpeechSynthesis controller. Framework-free. |
| `src/components/AccessibilityWidget/index.tsx` | `'use client'` FAB + panel UI, wires the hook and the controller. |
| `src/components/AccessibilityWidget/styles.css` | Widget chrome only (FAB, panel, controls). |
| `src/app/(frontend)/frontend.css` | Site-wide effects keyed off the `<html>` attributes. |
| `src/messages/en.json`, `src/messages/es.json` | `accessibility` namespace. |
| `src/app/(frontend)/[locale]/layout.tsx` | Mounts the widget and injects the pre-paint restore script. |
| `tests/unit/utilities/a11yPrefs.test.ts` | Prefs logic + restore-script unit tests. |
| `tests/unit/components/AccessibilityWidget.test.tsx` | Widget behaviour tests. |
| `tests/unit/components/readAloud.test.ts` | Speech controller tests. |
| `tests/e2e/accessibility-widget.e2e.spec.ts` | End-to-end incl. persistence across reload. |

---

## Task 1: Prefs utility module

**Files:**
- Create: `src/utilities/a11yPrefs.ts`
- Test: `tests/unit/utilities/a11yPrefs.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `A11Y_STORAGE_KEY: 'ak-a11y-prefs'`
  - `type TextScale = 1 | 1.15 | 1.3`
  - `type A11yPrefs = { textScale: TextScale; contrast: boolean; highlightLinks: boolean; reduceMotion: boolean }`
  - `DEFAULT_A11Y_PREFS: A11yPrefs`
  - `parseA11yPrefs(raw: string | null | undefined): A11yPrefs`
  - `serializeA11yPrefs(prefs: A11yPrefs): string`
  - `applyA11yPrefs(prefs: A11yPrefs, el: HTMLElement): void`
  - `readStoredA11yPrefs(): A11yPrefs`
  - `storeA11yPrefs(prefs: A11yPrefs): void`
  - `A11Y_RESTORE_SCRIPT: string`

Note: read-aloud is deliberately **not** part of `A11yPrefs`. It is a transient mode held in component state — restoring "click any text to hear it" silently on a return visit would be a surprising behaviour change the user did not re-consent to.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/utilities/a11yPrefs.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  A11Y_RESTORE_SCRIPT,
  A11Y_STORAGE_KEY,
  applyA11yPrefs,
  DEFAULT_A11Y_PREFS,
  parseA11yPrefs,
  readStoredA11yPrefs,
  serializeA11yPrefs,
  storeA11yPrefs,
} from '@/utilities/a11yPrefs'

describe('parseA11yPrefs', () => {
  it('returns defaults for null, empty, or malformed input', () => {
    expect(parseA11yPrefs(null)).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('not json')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('[1,2,3]')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('null')).toEqual(DEFAULT_A11Y_PREFS)
  })

  it('reads valid stored prefs', () => {
    const raw = JSON.stringify({
      textScale: 1.3,
      contrast: true,
      highlightLinks: false,
      reduceMotion: true,
    })
    expect(parseA11yPrefs(raw)).toEqual({
      textScale: 1.3,
      contrast: true,
      highlightLinks: false,
      reduceMotion: true,
    })
  })

  it('falls back per-field when individual fields are wrong types or out of range', () => {
    const raw = JSON.stringify({
      textScale: 99,
      contrast: 'yes',
      highlightLinks: true,
      reduceMotion: null,
    })
    expect(parseA11yPrefs(raw)).toEqual({
      textScale: 1,
      contrast: false,
      highlightLinks: true,
      reduceMotion: false,
    })
  })
})

describe('serializeA11yPrefs', () => {
  it('round-trips through parse', () => {
    const prefs = {
      textScale: 1.15 as const,
      contrast: true,
      highlightLinks: true,
      reduceMotion: false,
    }
    expect(parseA11yPrefs(serializeA11yPrefs(prefs))).toEqual(prefs)
  })
})

describe('applyA11yPrefs', () => {
  it('sets the text scale property and no attributes when everything is off', () => {
    const el = document.createElement('html')
    applyA11yPrefs(DEFAULT_A11Y_PREFS, el)
    expect(el.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1')
    expect(el.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(el.hasAttribute('data-a11y-links')).toBe(false)
    expect(el.hasAttribute('data-a11y-motion')).toBe(false)
  })

  it('sets every attribute when everything is on', () => {
    const el = document.createElement('html')
    applyA11yPrefs(
      { textScale: 1.3, contrast: true, highlightLinks: true, reduceMotion: true },
      el,
    )
    expect(el.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
    expect(el.getAttribute('data-a11y-contrast')).toBe('on')
    expect(el.getAttribute('data-a11y-links')).toBe('on')
    expect(el.getAttribute('data-a11y-motion')).toBe('reduce')
  })

  it('removes attributes when a pref is turned back off', () => {
    const el = document.createElement('html')
    applyA11yPrefs(
      { textScale: 1.3, contrast: true, highlightLinks: true, reduceMotion: true },
      el,
    )
    applyA11yPrefs(DEFAULT_A11Y_PREFS, el)
    expect(el.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(el.hasAttribute('data-a11y-links')).toBe(false)
    expect(el.hasAttribute('data-a11y-motion')).toBe(false)
  })
})

describe('storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('stores and reads back prefs', () => {
    const prefs = {
      textScale: 1.15 as const,
      contrast: false,
      highlightLinks: true,
      reduceMotion: false,
    }
    storeA11yPrefs(prefs)
    expect(readStoredA11yPrefs()).toEqual(prefs)
  })

  it('returns defaults and does not throw when localStorage reads throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredA11yPrefs()).toEqual(DEFAULT_A11Y_PREFS)
  })

  it('does not throw when localStorage writes throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => storeA11yPrefs(DEFAULT_A11Y_PREFS)).not.toThrow()
  })
})

describe('A11Y_RESTORE_SCRIPT', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
  })

  it('applies stored prefs to <html> when evaluated', () => {
    window.localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({
        textScale: 1.3,
        contrast: true,
        highlightLinks: false,
        reduceMotion: true,
      }),
    )
    // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as the browser would
    eval(A11Y_RESTORE_SCRIPT)
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
    expect(document.documentElement.hasAttribute('data-a11y-links')).toBe(false)
    expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('reduce')
  })

  it('does nothing and does not throw when storage holds garbage', () => {
    window.localStorage.setItem(A11Y_STORAGE_KEY, 'garbage{')
    expect(() => {
      // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as the browser would
      eval(A11Y_RESTORE_SCRIPT)
    }).not.toThrow()
    expect(document.documentElement.hasAttribute('data-a11y-contrast')).toBe(false)
  })

  it('contains no closing script tag that would break the inline tag', () => {
    expect(A11Y_RESTORE_SCRIPT.includes('</script')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm vitest run tests/unit/utilities/a11yPrefs.test.ts`
Expected: FAIL — cannot resolve `@/utilities/a11yPrefs`.

- [ ] **Step 3: Write the implementation**

Create `src/utilities/a11yPrefs.ts`:

```ts
export const A11Y_STORAGE_KEY = 'ak-a11y-prefs'

/** The three text-size steps offered in the panel. */
export const TEXT_SCALES = [1, 1.15, 1.3] as const
export type TextScale = (typeof TEXT_SCALES)[number]

export type A11yPrefs = {
  textScale: TextScale
  contrast: boolean
  highlightLinks: boolean
  reduceMotion: boolean
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  textScale: 1,
  contrast: false,
  highlightLinks: false,
  reduceMotion: false,
}

function isTextScale(value: unknown): value is TextScale {
  return TEXT_SCALES.some((scale) => scale === value)
}

function bool(value: unknown): boolean {
  return value === true
}

export function parseA11yPrefs(raw: string | null | undefined): A11yPrefs {
  if (!raw) return { ...DEFAULT_A11Y_PREFS }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ...DEFAULT_A11Y_PREFS }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...DEFAULT_A11Y_PREFS }
  }

  const candidate = parsed as Record<string, unknown>

  // Per-field fallback rather than all-or-nothing: a single bad field from an
  // older schema shouldn't silently reset every other preference the user set.
  return {
    textScale: isTextScale(candidate.textScale) ? candidate.textScale : DEFAULT_A11Y_PREFS.textScale,
    contrast: bool(candidate.contrast),
    highlightLinks: bool(candidate.highlightLinks),
    reduceMotion: bool(candidate.reduceMotion),
  }
}

export function serializeA11yPrefs(prefs: A11yPrefs): string {
  return JSON.stringify(prefs)
}

export function applyA11yPrefs(prefs: A11yPrefs, el: HTMLElement): void {
  el.style.setProperty('--ak-a11y-text-scale', String(prefs.textScale))
  toggleAttribute(el, 'data-a11y-contrast', prefs.contrast ? 'on' : null)
  toggleAttribute(el, 'data-a11y-links', prefs.highlightLinks ? 'on' : null)
  toggleAttribute(el, 'data-a11y-motion', prefs.reduceMotion ? 'reduce' : null)
}

function toggleAttribute(el: HTMLElement, name: string, value: string | null): void {
  if (value === null) el.removeAttribute(name)
  else el.setAttribute(name, value)
}

export function readStoredA11yPrefs(): A11yPrefs {
  // Private browsing and storage-blocking extensions make localStorage access
  // throw rather than return null, so this cannot be a plain read.
  try {
    return parseA11yPrefs(window.localStorage.getItem(A11Y_STORAGE_KEY))
  } catch {
    return { ...DEFAULT_A11Y_PREFS }
  }
}

export function storeA11yPrefs(prefs: A11yPrefs): void {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, serializeA11yPrefs(prefs))
  } catch {
    // Persistence is best-effort; the prefs still apply for this session.
  }
}

/**
 * Runs in <head> before first paint so stored preferences don't visibly flash
 * off on every navigation. Kept here, beside parseA11yPrefs, so the two
 * can't drift apart — the unit test evaluates this string directly.
 */
export const A11Y_RESTORE_SCRIPT = `(function(){try{var r=document.documentElement;var s=window.localStorage.getItem('${A11Y_STORAGE_KEY}');if(!s)return;var p=JSON.parse(s);if(p&&typeof p==='object'){if(p.textScale===1.15||p.textScale===1.3){r.style.setProperty('--ak-a11y-text-scale',String(p.textScale))}if(p.contrast===true){r.setAttribute('data-a11y-contrast','on')}if(p.highlightLinks===true){r.setAttribute('data-a11y-links','on')}if(p.reduceMotion===true){r.setAttribute('data-a11y-motion','reduce')}}}catch(e){}})()`
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `pnpm vitest run tests/unit/utilities/a11yPrefs.test.ts`
Expected: PASS, all cases.

- [ ] **Step 5: Lint**

Run: `pnpm lint:fix`
Expected: no remaining errors in the two new files.

- [ ] **Step 6: Commit**

```bash
git add src/utilities/a11yPrefs.ts tests/unit/utilities/a11yPrefs.test.ts
git commit -m "feat: accessibility preference storage and apply logic"
```

---

## Task 2: Site-wide CSS effects

**Files:**
- Modify: `src/app/(frontend)/frontend.css` (append a new section at the end)

**Interfaces:**
- Consumes: the `<html>` contract from Task 1 — `--ak-a11y-text-scale`, `data-a11y-contrast="on"`, `data-a11y-links="on"`, `data-a11y-motion="reduce"`.
- Produces: no JS surface. Verified end-to-end in Task 8.

This task has no unit test — it is pure CSS with no logic to assert in jsdom (`vitest.config.mts` sets `css: false`). Its behaviour is covered by the Playwright spec in Task 8, which asserts computed styles in a real browser.

- [ ] **Step 1: Append the effects section to `frontend.css`**

Add at the end of `src/app/(frontend)/frontend.css`:

```css
/* ─── Accessibility widget: site-wide effects ──────────────────
   Driven entirely by attributes the widget writes onto <html>.
   No component knows this exists. See
   docs/superpowers/specs/2026-07-27-accessibility-widget-design.md */

/* Text size. The DS is rem-based, so scaling the root scales the whole
   layout proportionally instead of breaking it. */
html {
  font-size: calc(100% * var(--ak-a11y-text-scale, 1));
}

/* High contrast — raise text against background beyond the brand palette,
   and make every boundary explicit. */
html[data-a11y-contrast='on'] {
  --bp-color-text: #000000;
  --bp-color-text-muted: #1a1a1a;
  --bp-color-bg: #ffffff;
  --bp-color-bg-subtle: #ffffff;
  --bp-color-bg-elevated: #ffffff;
  --bp-color-border: #000000;
}
html[data-a11y-contrast='on'] * {
  text-shadow: none !important;
}
/* Text sitting on top of imagery has no guaranteed contrast ratio, so give
   it an opaque backing plate rather than trying to tune the overlay. */
html[data-a11y-contrast='on'] :is(.ak-hero, .ak-machine-hero) :is(h1, h2, h3, p, span) {
  background-color: #000000;
  color: #ffffff;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* Highlight links — make every interactive target unmistakable. */
html[data-a11y-links='on'] :is(a, button):not(.ak-a11y-fab):not(.ak-a11y-panel *) {
  text-decoration: underline !important;
  text-underline-offset: 0.2em;
  outline: 2px solid var(--bp-color-border);
  outline-offset: 2px;
}

/* Reduce motion — complements the OS-level prefers-reduced-motion media
   query for users on shared or kiosk machines who can't change the OS
   setting themselves. */
html[data-a11y-motion='reduce'],
html[data-a11y-motion='reduce'] *,
html[data-a11y-motion='reduce'] *::before,
html[data-a11y-motion='reduce'] *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
html[data-a11y-motion='reduce'] {
  view-transition-name: none;
}
```

- [ ] **Step 2: Verify the app still builds and renders unchanged by default**

Run: `pnpm build`
Expected: build succeeds. With no prefs set, `--ak-a11y-text-scale` is unset so `font-size: calc(100% * 1)` — visually identical to today.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/frontend.css"
git commit -m "feat: site-wide accessibility effect styles"
```

---

## Task 3: `useA11yPrefs` hook

**Files:**
- Create: `src/components/AccessibilityWidget/useA11yPrefs.ts`
- Test: `tests/unit/components/useA11yPrefs.test.ts`

**Interfaces:**
- Consumes: `A11yPrefs`, `DEFAULT_A11Y_PREFS`, `readStoredA11yPrefs`, `storeA11yPrefs`, `applyA11yPrefs` from `@/utilities/a11yPrefs`.
- Produces:
  ```ts
  function useA11yPrefs(): {
    prefs: A11yPrefs
    setPref: <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => void
    reset: () => void
    hydrated: boolean
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/useA11yPrefs.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { A11Y_STORAGE_KEY, DEFAULT_A11Y_PREFS } from '@/utilities/a11yPrefs'
import { useA11yPrefs } from '@/components/AccessibilityWidget/useA11yPrefs'

describe('useA11yPrefs', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
  })

  it('starts at defaults and reports hydration after mount', () => {
    const { result } = renderHook(() => useA11yPrefs())
    expect(result.current.prefs).toEqual(DEFAULT_A11Y_PREFS)
    expect(result.current.hydrated).toBe(true)
  })

  it('hydrates from localStorage', () => {
    window.localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({
        textScale: 1.15,
        contrast: true,
        highlightLinks: false,
        reduceMotion: false,
      }),
    )
    const { result } = renderHook(() => useA11yPrefs())
    expect(result.current.prefs.textScale).toBe(1.15)
    expect(result.current.prefs.contrast).toBe(true)
  })

  it('setPref updates state, <html>, and localStorage', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('contrast', true)
    })
    expect(result.current.prefs.contrast).toBe(true)
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
    expect(JSON.parse(window.localStorage.getItem(A11Y_STORAGE_KEY) ?? '{}').contrast).toBe(true)
  })

  it('setPref updates the text scale custom property', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('textScale', 1.3)
    })
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
  })

  it('reset returns everything to defaults and clears the attributes', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('contrast', true)
      result.current.setPref('reduceMotion', true)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.prefs).toEqual(DEFAULT_A11Y_PREFS)
    expect(document.documentElement.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(document.documentElement.hasAttribute('data-a11y-motion')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm vitest run tests/unit/components/useA11yPrefs.test.ts`
Expected: FAIL — cannot resolve `@/components/AccessibilityWidget/useA11yPrefs`.

- [ ] **Step 3: Write the implementation**

Create `src/components/AccessibilityWidget/useA11yPrefs.ts`:

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  type A11yPrefs,
  applyA11yPrefs,
  DEFAULT_A11Y_PREFS,
  readStoredA11yPrefs,
  storeA11yPrefs,
} from '@/utilities/a11yPrefs'

export function useA11yPrefs() {
  // Start at defaults so server and first client render agree; the real
  // values arrive in the mount effect below. The <head> restore script has
  // already applied them to <html>, so there is no visual flash — only the
  // panel's own control states settle a tick later.
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_A11Y_PREFS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredA11yPrefs()
    setPrefs(stored)
    applyA11yPrefs(stored, document.documentElement)
    setHydrated(true)
  }, [])

  const commit = useCallback((next: A11yPrefs) => {
    setPrefs(next)
    applyA11yPrefs(next, document.documentElement)
    storeA11yPrefs(next)
  }, [])

  const setPref = useCallback(
    <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => {
      setPrefs((current) => {
        const next = { ...current, [key]: value }
        applyA11yPrefs(next, document.documentElement)
        storeA11yPrefs(next)
        return next
      })
    },
    [],
  )

  const reset = useCallback(() => {
    commit({ ...DEFAULT_A11Y_PREFS })
  }, [commit])

  return { prefs, setPref, reset, hydrated }
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `pnpm vitest run tests/unit/components/useA11yPrefs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AccessibilityWidget/useA11yPrefs.ts tests/unit/components/useA11yPrefs.test.ts
git commit -m "feat: useA11yPrefs hook"
```

---

## Task 4: Read-aloud controller

**Files:**
- Create: `src/components/AccessibilityWidget/readAloud.ts`
- Test: `tests/unit/components/readAloud.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `isSpeechSupported(): boolean`
  - `pickVoiceLang(htmlLang: string): string` — `'es'` → `'es-ES'`, anything else → `'en-US'`
  - `createReadAloud(getLang: () => string): ReadAloudController`
  - `type ReadAloudController = { speak(text: string): void; stop(): void; isSpeaking(): boolean }`
  - `READABLE_SELECTOR: string` — the selector for click-to-read targets.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/readAloud.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createReadAloud,
  isSpeechSupported,
  pickVoiceLang,
} from '@/components/AccessibilityWidget/readAloud'

class FakeUtterance {
  text: string
  lang = ''
  voice: unknown = null
  onend: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

function installFakeSpeech() {
  const spoken: FakeUtterance[] = []
  const synth = {
    speaking: false,
    cancel: vi.fn(() => {
      synth.speaking = false
    }),
    speak: vi.fn((u: FakeUtterance) => {
      spoken.push(u)
      synth.speaking = true
    }),
    getVoices: vi.fn(() => [{ lang: 'es-ES', name: 'Mónica' }, { lang: 'en-US', name: 'Alex' }]),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return { synth, spoken }
}

describe('pickVoiceLang', () => {
  it('maps the html lang to a BCP-47 voice locale', () => {
    expect(pickVoiceLang('es')).toBe('es-ES')
    expect(pickVoiceLang('en')).toBe('en-US')
    expect(pickVoiceLang('')).toBe('en-US')
  })
})

describe('isSpeechSupported', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is true when the API exists', () => {
    installFakeSpeech()
    expect(isSpeechSupported()).toBe(true)
  })

  it('is false when the API is missing', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(isSpeechSupported()).toBe(false)
  })
})

describe('createReadAloud', () => {
  let fake: ReturnType<typeof installFakeSpeech>

  beforeEach(() => {
    fake = installFakeSpeech()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('speaks the given text with the locale voice', () => {
    const controller = createReadAloud(() => 'es')
    controller.speak('Hola mundo')
    expect(fake.spoken).toHaveLength(1)
    expect(fake.spoken[0].text).toBe('Hola mundo')
    expect(fake.spoken[0].lang).toBe('es-ES')
  })

  it('cancels any in-flight speech before starting a new utterance', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('first')
    controller.speak('second')
    expect(fake.synth.cancel).toHaveBeenCalled()
    expect(fake.spoken).toHaveLength(2)
  })

  it('ignores empty or whitespace-only text', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('   ')
    controller.speak('')
    expect(fake.synth.speak).not.toHaveBeenCalled()
  })

  it('stop cancels speech', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('hello')
    controller.stop()
    expect(fake.synth.cancel).toHaveBeenCalled()
    expect(controller.isSpeaking()).toBe(false)
  })

  it('falls back to the default voice when no voice matches the locale', () => {
    fake.synth.getVoices = vi.fn(() => [])
    const controller = createReadAloud(() => 'es')
    expect(() => controller.speak('Hola')).not.toThrow()
    expect(fake.spoken[0].voice).toBeNull()
  })

  it('does nothing when the API is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const controller = createReadAloud(() => 'en')
    expect(() => controller.speak('hello')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm vitest run tests/unit/components/readAloud.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/AccessibilityWidget/readAloud.ts`:

```ts
/** Elements worth reading aloud when clicked. */
export const READABLE_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, a, button, figcaption'

export type ReadAloudController = {
  speak(text: string): void
  stop(): void
  isSpeaking(): boolean
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

export function pickVoiceLang(htmlLang: string): string {
  return htmlLang.toLowerCase().startsWith('es') ? 'es-ES' : 'en-US'
}

export function createReadAloud(getLang: () => string): ReadAloudController {
  let speaking = false

  function stop() {
    speaking = false
    if (!isSpeechSupported()) return
    window.speechSynthesis.cancel()
  }

  function speak(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!isSpeechSupported()) return

    // Chrome queues utterances rather than replacing them; without an
    // explicit cancel, clicking three paragraphs means waiting through all
    // three instead of hearing the last one.
    window.speechSynthesis.cancel()

    const lang = pickVoiceLang(getLang())
    const utterance = new SpeechSynthesisUtterance(trimmed)
    utterance.lang = lang

    // getVoices() is empty until the voices load; falling through with a null
    // voice lets the browser pick its own default for the requested lang.
    const match = window.speechSynthesis.getVoices().find((voice) => voice.lang === lang)
    if (match) utterance.voice = match

    utterance.onend = () => {
      speaking = false
    }

    speaking = true
    window.speechSynthesis.speak(utterance)
  }

  return {
    speak,
    stop,
    isSpeaking: () => speaking,
  }
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `pnpm vitest run tests/unit/components/readAloud.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AccessibilityWidget/readAloud.ts tests/unit/components/readAloud.test.ts
git commit -m "feat: native speech synthesis read-aloud controller"
```

---

## Task 5: Translations

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/es.json`

**Interfaces:**
- Produces: the `accessibility` namespace consumed by Task 6.

- [ ] **Step 1: Add the `accessibility` namespace to `src/messages/en.json`**

Add as a new top-level key, alongside the existing `consent` key:

```json
"accessibility": {
  "fabLabel": "Accessibility options",
  "title": "Accessibility",
  "close": "Close accessibility options",
  "textSize": "Text size",
  "textSizeNormal": "Normal",
  "textSizeLarge": "Large",
  "textSizeLarger": "Larger",
  "contrast": "High contrast",
  "highlightLinks": "Highlight links",
  "reduceMotion": "Reduce motion",
  "readAloud": "Read aloud",
  "readAloudHint": "Click any text on the page to hear it read out loud.",
  "stopReading": "Stop reading",
  "reset": "Reset all",
  "on": "on",
  "off": "off"
}
```

- [ ] **Step 2: Add the matching namespace to `src/messages/es.json`**

```json
"accessibility": {
  "fabLabel": "Opciones de accesibilidad",
  "title": "Accesibilidad",
  "close": "Cerrar opciones de accesibilidad",
  "textSize": "Tamaño del texto",
  "textSizeNormal": "Normal",
  "textSizeLarge": "Grande",
  "textSizeLarger": "Más grande",
  "contrast": "Alto contraste",
  "highlightLinks": "Resaltar enlaces",
  "reduceMotion": "Reducir movimiento",
  "readAloud": "Leer en voz alta",
  "readAloudHint": "Haz clic en cualquier texto de la página para escucharlo.",
  "stopReading": "Detener lectura",
  "reset": "Restablecer todo",
  "on": "activado",
  "off": "desactivado"
}
```

- [ ] **Step 3: Verify both files are valid JSON with identical key sets**

Run:
```bash
python3 -c "
import json
en=json.load(open('src/messages/en.json'))['accessibility']
es=json.load(open('src/messages/es.json'))['accessibility']
assert set(en)==set(es), set(en)^set(es)
print('ok', len(en), 'keys')
"
```
Expected: `ok 16 keys`

- [ ] **Step 4: Commit**

```bash
git add src/messages/en.json src/messages/es.json
git commit -m "feat: accessibility widget translations"
```

---

## Task 6: Widget component — FAB, panel, and preference controls

**Files:**
- Create: `src/components/AccessibilityWidget/index.tsx`
- Create: `src/components/AccessibilityWidget/styles.css`
- Test: `tests/unit/components/AccessibilityWidget.test.tsx`

**Interfaces:**
- Consumes: `useA11yPrefs()` (Task 3); `isSpeechSupported`, `createReadAloud`, `READABLE_SELECTOR` (Task 4); the `accessibility` messages (Task 5).
- Produces: `export function AccessibilityWidget(): JSX.Element` — default-exported nothing, named export only, mounted in Task 7.

Read-aloud click wiring is included here rather than split out, because the toggle and its document listener are one deliverable: a reviewer cannot sensibly approve the toggle without the behaviour it toggles.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/AccessibilityWidget.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { AccessibilityWidget } from '@/components/AccessibilityWidget'
import { A11Y_STORAGE_KEY } from '@/utilities/a11yPrefs'

function installFakeSpeech() {
  const synth = {
    speaking: false,
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => []),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string
      lang = ''
      voice: unknown = null
      onend: (() => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    },
  )
  return synth
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: 'fabLabel' }))
}

describe('AccessibilityWidget', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
    installFakeSpeech()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders the FAB collapsed with the panel closed', () => {
    render(<AccessibilityWidget />)
    const fab = screen.getByRole('button', { name: 'fabLabel' })
    expect(fab).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the panel and marks the FAB expanded', () => {
    render(<AccessibilityWidget />)
    openPanel()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fabLabel' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('closes the panel on Escape and returns focus to the FAB', () => {
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fabLabel' })).toHaveFocus()
  })

  it('toggles high contrast and reflects it on <html> and in aria-pressed', () => {
    render(<AccessibilityWidget />)
    openPanel()
    const toggle = screen.getByRole('button', { name: /contrast/ })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
  })

  it('selects a text size via the radio group', () => {
    render(<AccessibilityWidget />)
    openPanel()
    const larger = screen.getByRole('radio', { name: 'textSizeLarger' })
    fireEvent.click(larger)
    expect(larger).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
  })

  it('resets every preference', () => {
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: /reduceMotion/ }))
    expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('reduce')
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    expect(document.documentElement.hasAttribute('data-a11y-motion')).toBe(false)
    expect(JSON.parse(window.localStorage.getItem(A11Y_STORAGE_KEY) ?? '{}').reduceMotion).toBe(
      false,
    )
  })

  it('speaks a clicked paragraph while read-aloud is on', () => {
    const synth = installFakeSpeech()
    document.body.insertAdjacentHTML('afterbegin', '<main id="main-content"><p>Hello there</p></main>')
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: /readAloud/ }))

    const paragraph = document.querySelector('#main-content p') as HTMLElement
    fireEvent.click(paragraph)
    expect(synth.speak).toHaveBeenCalledTimes(1)

    document.getElementById('main-content')?.remove()
  })

  it('does not speak when read-aloud is off', () => {
    const synth = installFakeSpeech()
    document.body.insertAdjacentHTML('afterbegin', '<main id="main-content"><p>Hello there</p></main>')
    render(<AccessibilityWidget />)
    const paragraph = document.querySelector('#main-content p') as HTMLElement
    fireEvent.click(paragraph)
    expect(synth.speak).not.toHaveBeenCalled()
    document.getElementById('main-content')?.remove()
  })

  it('hides the read-aloud control when the browser lacks speech synthesis', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    render(<AccessibilityWidget />)
    openPanel()
    expect(screen.queryByRole('button', { name: /readAloud/ })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm vitest run tests/unit/components/AccessibilityWidget.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

Create `src/components/AccessibilityWidget/index.tsx`:

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { TEXT_SCALES, type TextScale } from '@/utilities/a11yPrefs'
import { createReadAloud, isSpeechSupported, READABLE_SELECTOR } from './readAloud'
import { useA11yPrefs } from './useA11yPrefs'
import './styles.css'

const SCALE_LABEL_KEYS: Record<TextScale, string> = {
  1: 'textSizeNormal',
  1.15: 'textSizeLarge',
  1.3: 'textSizeLarger',
}

export function AccessibilityWidget() {
  const t = useTranslations('accessibility')
  const { prefs, setPref, reset } = useA11yPrefs()
  const [open, setOpen] = useState(false)
  const [readAloud, setReadAloud] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()

  // Feature detection runs after mount: on the server there is no window, and
  // rendering the control then removing it would be a hydration mismatch.
  useEffect(() => {
    setSpeechAvailable(isSpeechSupported())
  }, [])

  const controller = useMemo(
    () => createReadAloud(() => document.documentElement.lang || 'en'),
    [],
  )

  const closePanel = useCallback(() => {
    setOpen(false)
    fabRef.current?.focus()
  }, [])

  // Esc closes the panel from anywhere and always stops speech — a user who
  // wants the talking to stop shouldn't have to find the right button first.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      controller.stop()
      if (open) closePanel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closePanel, controller])

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector<HTMLElement>('button, [role="radio"]')
    first?.focus()
  }, [open])

  // Click-to-read. Bound to the document (capture phase off) rather than to
  // each node so it keeps working across client-side navigations without
  // re-binding per page.
  useEffect(() => {
    if (!readAloud) return

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      if (!target) return
      // Never read the widget's own controls — that would make the panel
      // unusable while the mode is on.
      if (target.closest('.ak-a11y-fab, .ak-a11y-panel')) return

      const main = document.getElementById('main-content')
      if (!main || !main.contains(target)) return

      const readable = target.closest<HTMLElement>(READABLE_SELECTOR)
      if (!readable) return

      controller.speak(readable.textContent ?? '')
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [readAloud, controller])

  // Stop speech if the widget unmounts (route change, layout swap).
  useEffect(() => () => controller.stop(), [controller])

  function toggle(key: 'contrast' | 'highlightLinks' | 'reduceMotion', label: string) {
    const next = !prefs[key]
    setPref(key, next)
    setAnnouncement(`${label} ${next ? t('on') : t('off')}`)
  }

  function toggleReadAloud() {
    const next = !readAloud
    setReadAloud(next)
    if (!next) controller.stop()
    setAnnouncement(`${t('readAloud')} ${next ? t('on') : t('off')}`)
  }

  return (
    <>
      <button
        ref={fabRef}
        className="ak-a11y-fab"
        type="button"
        aria-label={t('fabLabel')}
        title={t('fabLabel')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
          <path d="M7 10.25h10" />
          <path d="M12 10.5v4m0 0-2.25 4m2.25-4 2.25 4" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="ak-a11y-panel"
          role="dialog"
          aria-labelledby={titleId}
        >
          <div className="ak-a11y-panel__header">
            <h2 id={titleId} className="ak-a11y-panel__title">
              {t('title')}
            </h2>
            <button
              className="ak-a11y-panel__close"
              type="button"
              aria-label={t('close')}
              onClick={closePanel}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <fieldset className="ak-a11y-group">
            <legend className="ak-a11y-group__legend">{t('textSize')}</legend>
            {/* biome-ignore lint/a11y/useSemanticElements: a radiogroup of buttons keeps the roving-focus behaviour consistent with the toggles beside it */}
            <div className="ak-a11y-scale" role="radiogroup" aria-label={t('textSize')}>
              {TEXT_SCALES.map((scale) => (
                <button
                  key={scale}
                  className="ak-a11y-scale__option"
                  type="button"
                  role="radio"
                  aria-checked={prefs.textScale === scale}
                  tabIndex={prefs.textScale === scale ? 0 : -1}
                  onClick={() => {
                    setPref('textScale', scale)
                    setAnnouncement(`${t('textSize')} ${t(SCALE_LABEL_KEYS[scale])}`)
                  }}
                >
                  {t(SCALE_LABEL_KEYS[scale])}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="ak-a11y-toggles">
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.contrast}
              onClick={() => toggle('contrast', t('contrast'))}
            >
              {t('contrast')}
            </button>
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.highlightLinks}
              onClick={() => toggle('highlightLinks', t('highlightLinks'))}
            >
              {t('highlightLinks')}
            </button>
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.reduceMotion}
              onClick={() => toggle('reduceMotion', t('reduceMotion'))}
            >
              {t('reduceMotion')}
            </button>
            {speechAvailable && (
              <button
                className="ak-a11y-toggle"
                type="button"
                aria-pressed={readAloud}
                onClick={toggleReadAloud}
              >
                {t('readAloud')}
              </button>
            )}
          </div>

          {speechAvailable && readAloud && (
            <>
              <p className="ak-a11y-hint">{t('readAloudHint')}</p>
              <button
                className="ak-a11y-stop"
                type="button"
                onClick={() => controller.stop()}
              >
                {t('stopReading')}
              </button>
            </>
          )}

          <button
            className="ak-a11y-reset"
            type="button"
            onClick={() => {
              reset()
              setReadAloud(false)
              controller.stop()
              setAnnouncement(t('reset'))
            }}
          >
            {t('reset')}
          </button>

          <p className="ak-a11y-sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Write the stylesheet**

Create `src/components/AccessibilityWidget/styles.css`:

```css
/* src/components/AccessibilityWidget/styles.css
   The FAB shares the bottom-left column with .ak-consent-reopen-btn
   (ConsentBanner/styles.css) and sits in the slot directly above it. */

.ak-a11y-fab {
  position: fixed;
  inset-inline-start: var(--bp-space-4, 1rem);
  /* 3rem consent FAB + 0.75rem gap + its own bottom offset, lifted clear of
     mobile browser chrome the same way the consent card is. */
  bottom: calc(var(--bp-space-4, 1rem) + 3.75rem + env(safe-area-inset-bottom, 0px));
  z-index: var(--a11y-z-index, 50);
  width: 3rem;
  height: 3rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--bp-color-border);
  background: var(--bp-color-surface, #fff);
  color: var(--bp-color-text);
  box-shadow: var(--bp-shadow-lg);
  cursor: pointer;
}
.ak-a11y-fab:hover {
  color: var(--a11y-hover-color, var(--ak-accent, var(--bp-primary)));
}
.ak-a11y-fab svg {
  width: 1.5rem;
  height: 1.5rem;
}

.ak-a11y-panel {
  position: fixed;
  inset-inline-start: var(--bp-space-4, 1rem);
  bottom: calc(var(--bp-space-4, 1rem) + 7.5rem + env(safe-area-inset-bottom, 0px));
  z-index: var(--a11y-z-index, 50);
  width: min(20rem, calc(100vw - 2 * var(--bp-space-4, 1rem)));
  max-height: min(30rem, calc(100vh - 12rem));
  overflow-y: auto;
  background: var(--bp-color-surface, #fff);
  border: 1px solid var(--bp-color-border);
  border-radius: var(--bp-radius-lg, 0.75rem);
  box-shadow: var(--bp-shadow-xl, var(--bp-shadow-lg));
  padding: var(--bp-space-4, 1rem);
}

.ak-a11y-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--bp-space-3, 0.75rem);
}
.ak-a11y-panel__title {
  margin: 0;
  font-size: var(--bp-text-lg, 1.125rem);
  color: var(--bp-color-text);
}
.ak-a11y-panel__close {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--bp-color-text-muted);
  cursor: pointer;
}
.ak-a11y-panel__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.ak-a11y-group {
  margin: 0 0 var(--bp-space-4, 1rem);
  padding: 0;
  border: none;
}
.ak-a11y-group__legend {
  padding: 0;
  margin-bottom: var(--bp-space-2, 0.5rem);
  font-size: var(--bp-text-sm, 0.875rem);
  color: var(--bp-color-text-muted);
}

.ak-a11y-scale {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--bp-space-1, 0.25rem);
  padding: var(--bp-space-1, 0.25rem);
  border: 1px solid var(--bp-color-border);
  border-radius: var(--bp-radius-md, 0.5rem);
}
.ak-a11y-scale__option {
  padding: var(--bp-space-2, 0.5rem);
  border: none;
  border-radius: var(--bp-radius-sm, 0.375rem);
  background: transparent;
  color: var(--bp-color-text);
  font-size: var(--bp-text-sm, 0.875rem);
  cursor: pointer;
}
.ak-a11y-scale__option[aria-checked='true'] {
  background: var(--a11y-selected-bg, var(--bp-color-bg-subtle));
  font-weight: 600;
}

.ak-a11y-toggles {
  display: grid;
  gap: var(--bp-space-2, 0.5rem);
}
.ak-a11y-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--bp-space-2, 0.5rem);
  width: 100%;
  padding: var(--bp-space-3, 0.75rem);
  border: 1px solid var(--bp-color-border);
  border-radius: var(--bp-radius-md, 0.5rem);
  background: transparent;
  color: var(--bp-color-text);
  font-size: var(--bp-text-sm, 0.875rem);
  text-align: start;
  cursor: pointer;
}
/* A pseudo-element switch keeps the on/off state visible without relying on
   colour alone. */
.ak-a11y-toggle::after {
  content: '';
  flex: none;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: var(--bp-radius-full, 9999px);
  border: 1px solid var(--bp-color-border);
  background: var(--bp-color-bg-subtle);
}
.ak-a11y-toggle[aria-pressed='true'] {
  border-color: var(--a11y-active-color, var(--ak-accent, var(--bp-primary)));
}
.ak-a11y-toggle[aria-pressed='true']::after {
  background: var(--a11y-active-color, var(--ak-accent, var(--bp-primary)));
  border-color: var(--a11y-active-color, var(--ak-accent, var(--bp-primary)));
}

.ak-a11y-hint {
  margin: var(--bp-space-3, 0.75rem) 0 var(--bp-space-2, 0.5rem);
  font-size: var(--bp-text-sm, 0.875rem);
  color: var(--bp-color-text-muted);
  line-height: 1.5;
}

.ak-a11y-stop,
.ak-a11y-reset {
  width: 100%;
  margin-top: var(--bp-space-2, 0.5rem);
  padding: var(--bp-space-2, 0.5rem);
  border: 1px solid var(--bp-color-border);
  border-radius: var(--bp-radius-md, 0.5rem);
  background: transparent;
  color: var(--bp-color-text);
  font-size: var(--bp-text-sm, 0.875rem);
  cursor: pointer;
}

.ak-a11y-fab:focus-visible,
.ak-a11y-panel :is(button, [role='radio']):focus-visible {
  outline: 2px solid var(--a11y-active-color, var(--ak-accent, var(--bp-primary)));
  outline-offset: 2px;
}

.ak-a11y-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `pnpm vitest run tests/unit/components/AccessibilityWidget.test.tsx`
Expected: PASS, all 10 cases.

- [ ] **Step 6: Lint**

Run: `pnpm lint:fix`

- [ ] **Step 7: Commit**

```bash
git add src/components/AccessibilityWidget tests/unit/components/AccessibilityWidget.test.tsx
git commit -m "feat: accessibility widget panel and controls"
```

---

## Task 7: Mount the widget and the pre-paint restore script

**Files:**
- Modify: `src/app/(frontend)/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `AccessibilityWidget` (Task 6), `A11Y_RESTORE_SCRIPT` (Task 1).
- Produces: the widget rendering on every frontend page.

- [ ] **Step 1: Add the imports**

In `src/app/(frontend)/[locale]/layout.tsx`, alongside the existing component imports:

```tsx
import { AccessibilityWidget } from '@/components/AccessibilityWidget'
import { A11Y_RESTORE_SCRIPT } from '@/utilities/a11yPrefs'
```

- [ ] **Step 2: Inject the restore script into `<head>`**

Inside the existing `<head>`, immediately after the two JSON-LD `<script>` tags and before the `<link rel="icon">` tags, add:

```tsx
<script
  // Must run before first paint, so it's a plain blocking inline script
  // rather than next/script — otherwise stored prefs visibly flash off
  // on every navigation.
  // biome-ignore lint/security/noDangerouslySetInnerHtml: static build-time constant, no user input
  dangerouslySetInnerHTML={{ __html: A11Y_RESTORE_SCRIPT }}
/>
```

- [ ] **Step 3: Mount the widget**

In the same file, inside `<Providers>`, immediately after `<ConsentManager initialConsent={consent} />`:

```tsx
<AccessibilityWidget />
```

- [ ] **Step 4: Verify the app builds and type-checks**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(frontend)/[locale]/layout.tsx"
git commit -m "feat: mount accessibility widget in the locale layout"
```

---

## Task 8: End-to-end coverage

**Files:**
- Create: `tests/e2e/accessibility-widget.e2e.spec.ts`

**Interfaces:**
- Consumes: the running app from Task 7.
- Produces: nothing consumed by later tasks.

This is where the Task 2 CSS gets verified — computed styles require a real browser, which jsdom cannot provide.

- [ ] **Step 1: Write the spec**

Create `tests/e2e/accessibility-widget.e2e.spec.ts`:

```ts
// tests/e2e/accessibility-widget.e2e.spec.ts
import { expect, test } from '@playwright/test'

const FAB = /accessibility options|opciones de accesibilidad/i

test.describe('Accessibility widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.evaluate(() => window.localStorage.removeItem('ak-a11y-prefs'))
    await page.reload()
  })

  test('opens the panel from the floating button', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await expect(page.getByRole('dialog', { name: /accessibility|accesibilidad/i })).toBeVisible()
  })

  test('does not overlap the cookie preferences button', async ({ page }) => {
    await page.getByRole('button', { name: /reject|rechazar/i }).click()
    const a11y = await page.getByRole('button', { name: FAB }).boundingBox()
    const cookies = await page
      .getByRole('button', { name: /cookie preferences|preferencias de cookies/i })
      .boundingBox()
    expect(a11y).not.toBeNull()
    expect(cookies).not.toBeNull()
    // The a11y FAB sits entirely above the cookie FAB.
    expect((a11y?.y ?? 0) + (a11y?.height ?? 0)).toBeLessThanOrEqual(cookies?.y ?? 0)
  })

  test('larger text actually increases the root font size', async ({ page }) => {
    const before = await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    )
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('radio', { name: /larger|más grande/i }).click()
    const after = await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    )
    expect(Number.parseFloat(after)).toBeGreaterThan(Number.parseFloat(before))
  })

  test('preferences survive a reload', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('button', { name: /high contrast|alto contraste/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'on')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'on')
    await page.getByRole('button', { name: FAB }).click()
    await expect(page.getByRole('button', { name: /high contrast|alto contraste/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('reset clears every preference', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('button', { name: /reduce motion|reducir movimiento/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-motion', 'reduce')
    await page.getByRole('button', { name: /reset all|restablecer todo/i }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-a11y-motion', 'reduce')
  })

  test('the panel is reachable and closable by keyboard alone', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('button', { name: FAB })).toBeFocused()
  })
})
```

- [ ] **Step 2: Run the e2e spec**

Run: `pnpm test:e2e -- accessibility-widget`
Expected: all 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility-widget.e2e.spec.ts
git commit -m "test: accessibility widget e2e coverage"
```

---

## Task 9: Client manual entry

**Files:**
- Modify: `docs/CLIENT-MANUAL.md`

- [ ] **Step 1: Add a bullet to the relevant section**

Add under the site-wide features section:

```markdown
- **Accessibility widget** — the round accessibility button at the bottom-left of every
  page opens a panel with text size, high contrast, link highlighting, reduced motion,
  and read-aloud. It is always on and needs no configuration in `/admin`. Its labels are
  translated in the site's message files (`src/messages/en.json` / `es.json`), not the
  CMS, so changing that wording is a developer task.
```

- [ ] **Step 2: Commit**

```bash
git add docs/CLIENT-MANUAL.md
git commit -m "docs: client manual entry for the accessibility widget"
```

---

## Self-Review Notes

Spec coverage check against `2026-07-27-accessibility-widget-design.md`:

| Spec requirement | Task |
|---|---|
| Bottom-left FAB stacked above the consent FAB | 6 (CSS), 8 (asserted) |
| localStorage persistence, key `ak-a11y-prefs` | 1, 3 |
| Pre-paint restore script | 1, 7 |
| Text size 3 steps | 1, 2, 6 |
| High contrast | 2, 6 |
| Highlight links | 2, 6 |
| Reduce motion | 2, 6 |
| Read aloud + feature detection + cancel triggers | 4, 6 |
| Widget's own a11y (aria-expanded, dialog, focus return, aria-pressed, live region) | 6, 8 |
| Error handling: blocked localStorage, corrupt JSON, no matching voice | 1, 4 |
| en + es translations | 5 |
| No Payload change | verified by absence of any collection/global edit |
| Client manual bullet | 9 |

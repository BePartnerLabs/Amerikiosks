# GDPR Consent Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cookie-consent banner that gates GA4 loading behind explicit opt-in, per `openspec/changes/gdpr-consent-banner/design.md`.

**Architecture:** A single client-side orchestrator component (`ConsentManager`) holds all UI state (open/expanded/analytics toggle) and writes a JSON cookie (`ak_consent`) on accept/reject/save, then calls `router.refresh()`. The Server Component `layout.tsx` reads that cookie via `cookies()` on every render and only injects the GA4 `<Script>` tags when `analytics: true`. `ConsentManager` renders one of two pure presentational children: `ConsentBanner` (bottom bar, collapsed or expanded) or `ConsentPreferencesButton` (floating reopen button), depending on its internal state — never both at once.

**Tech Stack:** Next.js 16 App Router (Server Components + `next/navigation` `useRouter().refresh()`), `next-intl` for copy, BPL DS `.bp-btn` / `.bp-toggle` primitives, Vitest + Testing Library for unit tests, Playwright for e2e.

## Global Constraints

- Cookie name: `ak_consent`. Value: JSON `{ analytics: boolean, timestamp: string }` (ISO 8601 timestamp).
- Cookie attributes: `path=/; max-age=31536000; SameSite=Lax` (1 year, non-httpOnly since it must be read by the client that writes it).
- Categories: `necessary` (always on, no toggle, generic copy — no per-cookie listing) and `analytics` (GA4, off by default until decided).
- No marketing/ads category — confirmed via audit of the live WordPress site: only GA4 (`gtag.js`) is present, no Facebook/LinkedIn/TikTok/Hotjar/Clarity/Bing pixels.
- DS markup verbatim: buttons use `.bp-btn` / `.bp-btn--secondary` / `.bp-btn--ghost`; toggles use the `.bp-toggle` structure (label > input.bp-toggle__input + span.bp-toggle__track > span.bp-toggle__thumb + span.bp-toggle__label). Level 2 overrides only via `--consent-banner-*` custom properties, declared in `src/components/ConsentBanner/styles.css`, never inline `style=`.
- All banner copy comes from `next-intl` messages (`src/messages/en.json` / `src/messages/es.json`), under a top-level `consent` key — never hardcoded strings in components.
- No layout shift/flash: the decision of whether to show the banner, the floating button, or the GA4 scripts is made server-side (`cookies()` in `layout.tsx`) before HTML is sent.
- Commit message subjects must be lowercase after `type:` per the monorepo's commitlint rule (e.g. `feat: add consent cookie utility`, not `feat: Add consent cookie utility`).

---

### Task 1: Consent cookie utility

**Files:**
- Create: `src/utilities/consent.ts`
- Test: `tests/unit/utilities/consent.test.ts`

**Interfaces:**
- Produces:
  - `CONSENT_COOKIE_NAME: string` — the literal `'ak_consent'`
  - `CONSENT_COOKIE_MAX_AGE: number` — `31536000` (seconds, 1 year)
  - `type ConsentPreferences = { analytics: boolean; timestamp: string }`
  - `parseConsentCookie(raw: string | undefined): ConsentPreferences | null` — returns `null` for `undefined`, invalid JSON, or a shape missing `analytics: boolean` / `timestamp: string`
  - `serializeConsentCookie(analytics: boolean): string` — returns a JSON string `{ analytics, timestamp: new Date().toISOString() }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/unit/utilities/consent.test.ts
import { describe, expect, it } from 'vitest'
import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  parseConsentCookie,
  serializeConsentCookie,
} from '@/utilities/consent'

describe('consent utility', () => {
  it('exposes the cookie name and a 1-year max-age', () => {
    expect(CONSENT_COOKIE_NAME).toBe('ak_consent')
    expect(CONSENT_COOKIE_MAX_AGE).toBe(31536000)
  })

  it('returns null when the raw cookie value is undefined', () => {
    expect(parseConsentCookie(undefined)).toBeNull()
  })

  it('returns null when the raw cookie value is not valid JSON', () => {
    expect(parseConsentCookie('not-json')).toBeNull()
  })

  it('returns null when analytics is missing or not a boolean', () => {
    expect(parseConsentCookie(JSON.stringify({ timestamp: '2026-01-01T00:00:00.000Z' }))).toBeNull()
    expect(
      parseConsentCookie(JSON.stringify({ analytics: 'yes', timestamp: '2026-01-01T00:00:00.000Z' })),
    ).toBeNull()
  })

  it('returns null when timestamp is missing or not a string', () => {
    expect(parseConsentCookie(JSON.stringify({ analytics: true }))).toBeNull()
  })

  it('parses a valid cookie value', () => {
    const value = JSON.stringify({ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' })
    expect(parseConsentCookie(value)).toEqual({ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' })
  })

  it('serializes accepted analytics consent with an ISO timestamp', () => {
    const raw = serializeConsentCookie(true)
    const parsed = parseConsentCookie(raw)
    expect(parsed?.analytics).toBe(true)
    expect(() => new Date(parsed?.timestamp ?? '')).not.toThrow()
    expect(new Date(parsed?.timestamp ?? '').toISOString()).toBe(parsed?.timestamp)
  })

  it('serializes rejected analytics consent', () => {
    const raw = serializeConsentCookie(false)
    expect(parseConsentCookie(raw)?.analytics).toBe(false)
  })

  it('round-trips through serialize then parse', () => {
    const raw = serializeConsentCookie(true)
    expect(parseConsentCookie(raw)).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/unit/utilities/consent.test.ts`
Expected: FAIL — `Cannot find module '@/utilities/consent'`

- [ ] **Step 3: Write the implementation**

```typescript
// src/utilities/consent.ts
export const CONSENT_COOKIE_NAME = 'ak_consent'
export const CONSENT_COOKIE_MAX_AGE = 31536000 // 1 year, in seconds

export type ConsentPreferences = {
  analytics: boolean
  timestamp: string
}

export function parseConsentCookie(raw: string | undefined): ConsentPreferences | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null

  const candidate = parsed as Record<string, unknown>
  if (typeof candidate.analytics !== 'boolean') return null
  if (typeof candidate.timestamp !== 'string') return null

  return { analytics: candidate.analytics, timestamp: candidate.timestamp }
}

export function serializeConsentCookie(analytics: boolean): string {
  const preferences: ConsentPreferences = { analytics, timestamp: new Date().toISOString() }
  return JSON.stringify(preferences)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/unit/utilities/consent.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utilities/consent.ts tests/unit/utilities/consent.test.ts
git commit -m "feat: add consent cookie parse/serialize utility"
```

---

### Task 2: Consent copy in i18n messages

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/es.json`

**Interfaces:**
- Produces: a top-level `consent` key in both message files, consumed by `ConsentBanner` and `ConsentPreferencesButton` in Task 3 via `useTranslations('consent')`.

**Keys required:** `ariaLabel`, `description`, `necessaryLabel`, `analyticsLabel`, `acceptAll`, `reject`, `preferences`, `save`, `reopenAriaLabel`.

- [ ] **Step 1: Add the `consent` key to `src/messages/en.json`**

Insert as a new top-level key (alongside `nav`, `footer`, `search`, `insights`, `pagination`, `notFound`):

```json
"consent": {
  "ariaLabel": "Cookie consent",
  "description": "We use cookies to run this site and, with your permission, to understand how it's used. Necessary cookies are always on.",
  "necessaryLabel": "Necessary",
  "analyticsLabel": "Analytics",
  "acceptAll": "Accept all",
  "reject": "Reject",
  "preferences": "Preferences",
  "save": "Save preferences",
  "reopenAriaLabel": "Cookie preferences"
}
```

- [ ] **Step 2: Add the matching `consent` key to `src/messages/es.json`**

```json
"consent": {
  "ariaLabel": "Consentimiento de cookies",
  "description": "Usamos cookies para operar este sitio y, con tu permiso, para entender cómo se usa. Las cookies necesarias siempre están activas.",
  "necessaryLabel": "Necesarias",
  "analyticsLabel": "Analíticas",
  "acceptAll": "Aceptar todo",
  "reject": "Rechazar",
  "preferences": "Preferencias",
  "save": "Guardar preferencias",
  "reopenAriaLabel": "Preferencias de cookies"
}
```

- [ ] **Step 3: Verify the JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json')); JSON.parse(require('fs').readFileSync('src/messages/es.json')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add src/messages/en.json src/messages/es.json
git commit -m "feat: add consent banner copy to en/es messages"
```

---

### Task 3: Presentational components — ConsentBanner and ConsentPreferencesButton

**Files:**
- Create: `src/components/ConsentBanner/ConsentBanner.tsx`
- Create: `src/components/ConsentBanner/ConsentPreferencesButton.tsx`
- Create: `src/components/ConsentBanner/styles.css`
- Test: `tests/unit/components/ConsentBanner.test.tsx`
- Test: `tests/unit/components/ConsentPreferencesButton.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks except the `consent` i18n keys from Task 2 (via `useTranslations('consent')`, mocked in tests).
- Produces:
  - `ConsentBanner` props: `{ expanded: boolean; analyticsChecked: boolean; onExpand: () => void; onAnalyticsChange: (checked: boolean) => void; onAcceptAll: () => void; onReject: () => void; onSave: () => void }`
  - `ConsentPreferencesButton` props: `{ onClick: () => void }`
  - Both are pure/stateless — no cookie or router logic lives here (that's Task 4's `ConsentManager`).

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/components/ConsentBanner.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { ConsentBanner } from '@/components/ConsentBanner/ConsentBanner'

describe('ConsentBanner', () => {
  afterEach(cleanup)

  const noop = () => {}

  it('renders collapsed actions when not expanded', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'acceptAll' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reject' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'preferences' })).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: 'analyticsLabel' })).not.toBeInTheDocument()
  })

  it('calls onAcceptAll when the accept button is clicked', () => {
    const onAcceptAll = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={onAcceptAll}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'acceptAll' }))
    expect(onAcceptAll).toHaveBeenCalledTimes(1)
  })

  it('calls onReject when the reject button is clicked', () => {
    const onReject = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={onReject}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'reject' }))
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  it('calls onExpand when preferences is clicked', () => {
    const onExpand = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={onExpand}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'preferences' }))
    expect(onExpand).toHaveBeenCalledTimes(1)
  })

  it('shows the necessary (always-on, disabled) and analytics toggles when expanded', () => {
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    const necessary = screen.getByRole('switch', { name: 'necessaryLabel' })
    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    const analytics = screen.getByRole('switch', { name: 'analyticsLabel' })
    expect(analytics).toBeChecked()
    expect(analytics).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
  })

  it('calls onAnalyticsChange with the new checked state when the analytics toggle changes', () => {
    const onAnalyticsChange = vi.fn()
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={onAnalyticsChange}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('switch', { name: 'analyticsLabel' }))
    expect(onAnalyticsChange).toHaveBeenCalledWith(false)
  })

  it('calls onSave when the save button is clicked in expanded mode', () => {
    const onSave = vi.fn()
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={false}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={onSave}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})
```

```tsx
// tests/unit/components/ConsentPreferencesButton.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { ConsentPreferencesButton } from '@/components/ConsentBanner/ConsentPreferencesButton'

describe('ConsentPreferencesButton', () => {
  afterEach(cleanup)

  it('renders a button with the reopen aria-label', () => {
    render(<ConsentPreferencesButton onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'reopenAriaLabel' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ConsentPreferencesButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'reopenAriaLabel' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/unit/components/ConsentBanner.test.tsx tests/unit/components/ConsentPreferencesButton.test.tsx`
Expected: FAIL — modules under `@/components/ConsentBanner/` don't exist yet

- [ ] **Step 3: Write `ConsentBanner.tsx`**

```tsx
// src/components/ConsentBanner/ConsentBanner.tsx
'use client'

import { useTranslations } from 'next-intl'
import './styles.css'

type Props = {
  expanded: boolean
  analyticsChecked: boolean
  onExpand: () => void
  onAnalyticsChange: (checked: boolean) => void
  onAcceptAll: () => void
  onReject: () => void
  onSave: () => void
}

export function ConsentBanner({
  expanded,
  analyticsChecked,
  onExpand,
  onAnalyticsChange,
  onAcceptAll,
  onReject,
  onSave,
}: Props) {
  const t = useTranslations('consent')

  return (
    <div
      className="ak-consent-banner"
      role="region"
      aria-label={t('ariaLabel')}
    >
      <div className="ak-consent-banner__inner">
        <p className="ak-consent-banner__text">{t('description')}</p>

        {!expanded ? (
          <div className="ak-consent-banner__actions">
            <button
              className="bp-btn bp-btn--secondary"
              type="button"
              onClick={onExpand}
            >
              {t('preferences')}
            </button>
            <button
              className="bp-btn bp-btn--ghost"
              type="button"
              onClick={onReject}
            >
              {t('reject')}
            </button>
            <button
              className="bp-btn"
              type="button"
              onClick={onAcceptAll}
            >
              {t('acceptAll')}
            </button>
          </div>
        ) : (
          <div className="ak-consent-banner__preferences">
            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('necessaryLabel')}
                checked
                disabled
                readOnly
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('necessaryLabel')}</span>
            </label>

            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('analyticsLabel')}
                checked={analyticsChecked}
                onChange={(e) => onAnalyticsChange(e.target.checked)}
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('analyticsLabel')}</span>
            </label>

            <button
              className="bp-btn"
              type="button"
              onClick={onSave}
            >
              {t('save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `ConsentPreferencesButton.tsx`**

```tsx
// src/components/ConsentBanner/ConsentPreferencesButton.tsx
'use client'

import { useTranslations } from 'next-intl'
import './styles.css'

type Props = {
  onClick: () => void
}

export function ConsentPreferencesButton({ onClick }: Props) {
  const t = useTranslations('consent')

  return (
    <button
      className="ak-consent-reopen-btn bp-btn bp-btn--ghost"
      type="button"
      aria-label={t('reopenAriaLabel')}
      onClick={onClick}
    >
      {t('reopenAriaLabel')}
    </button>
  )
}
```

- [ ] **Step 5: Write `styles.css`**

```css
/* src/components/ConsentBanner/styles.css */
.ak-consent-banner {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--consent-banner-z-index, 50);
  background: var(--consent-banner-background, var(--bp-color-surface, #fff));
  border-top: 1px solid var(--bp-color-border);
  box-shadow: var(--bp-shadow-md);
}

.ak-consent-banner__inner {
  max-width: var(--bp-container-max-width, 75rem);
  margin-inline: auto;
  padding: var(--bp-space-4, 1rem) var(--bp-space-6, 1.5rem);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--bp-space-4, 1rem);
}

.ak-consent-banner__text {
  flex: 1 1 20rem;
  margin: 0;
  color: var(--bp-color-text);
}

.ak-consent-banner__actions,
.ak-consent-banner__preferences {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--bp-space-3, 0.75rem);
}

.ak-consent-reopen-btn {
  position: fixed;
  inset-inline-start: var(--bp-space-4, 1rem);
  bottom: var(--bp-space-4, 1rem);
  z-index: var(--consent-banner-z-index, 50);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm vitest run tests/unit/components/ConsentBanner.test.tsx tests/unit/components/ConsentPreferencesButton.test.tsx`
Expected: PASS (9 tests total)

- [ ] **Step 7: Commit**

```bash
git add src/components/ConsentBanner tests/unit/components/ConsentBanner.test.tsx tests/unit/components/ConsentPreferencesButton.test.tsx
git commit -m "feat: add consent banner and reopen button components"
```

---

### Task 4: ConsentManager orchestrator

**Files:**
- Create: `src/components/ConsentBanner/ConsentManager.tsx`
- Test: `tests/unit/components/ConsentManager.test.tsx`

**Interfaces:**
- Consumes:
  - `CONSENT_COOKIE_NAME`, `CONSENT_COOKIE_MAX_AGE`, `serializeConsentCookie` from `@/utilities/consent` (Task 1)
  - `ConsentBanner` and `ConsentPreferencesButton` from Task 3, with the exact prop shapes defined there
  - `useRouter` from `next/navigation` (`.refresh()`)
- Produces: `ConsentManager` component, props `{ initialConsent: ConsentPreferences | null }` — this is what `layout.tsx` (Task 5) renders.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/components/ConsentManager.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { ConsentManager } from '@/components/ConsentBanner/ConsentManager'

function getCookieValue(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')
}

describe('ConsentManager', () => {
  afterEach(() => {
    cleanup()
    refresh.mockClear()
    document.cookie = 'ak_consent=; path=/; max-age=0'
  })

  it('shows the banner and no floating button when there is no prior consent', () => {
    render(<ConsentManager initialConsent={null} />)
    expect(screen.getByRole('region', { name: 'ariaLabel' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'reopenAriaLabel' })).not.toBeInTheDocument()
  })

  it('shows the floating button and no banner when consent was already decided', () => {
    render(<ConsentManager initialConsent={{ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' }} />)
    expect(screen.queryByRole('region', { name: 'ariaLabel' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reopenAriaLabel' })).toBeInTheDocument()
  })

  it('writes an accepted consent cookie and refreshes the router on "accept all"', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'acceptAll' }))

    const raw = getCookieValue('ak_consent')
    expect(raw).toBeDefined()
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(true)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('writes a rejected consent cookie on "reject"', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'reject' }))

    const raw = getCookieValue('ak_consent')
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('expands to preferences, toggles analytics off, and saves that choice', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'preferences' }))
    fireEvent.click(screen.getByRole('switch', { name: 'analyticsLabel' }))
    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    const raw = getCookieValue('ak_consent')
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('reopens the banner in expanded mode when the floating button is clicked', () => {
    render(<ConsentManager initialConsent={{ analytics: false, timestamp: '2026-01-01T00:00:00.000Z' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'reopenAriaLabel' }))

    expect(screen.getByRole('region', { name: 'ariaLabel' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'analyticsLabel' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/unit/components/ConsentManager.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ConsentBanner/ConsentManager'`

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/ConsentBanner/ConsentManager.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ConsentPreferences } from '@/utilities/consent'
import { CONSENT_COOKIE_MAX_AGE, CONSENT_COOKIE_NAME, serializeConsentCookie } from '@/utilities/consent'
import { ConsentBanner } from './ConsentBanner'
import { ConsentPreferencesButton } from './ConsentPreferencesButton'

type Props = {
  initialConsent: ConsentPreferences | null
}

export function ConsentManager({ initialConsent }: Props) {
  const router = useRouter()
  const [decided, setDecided] = useState(initialConsent !== null)
  const [open, setOpen] = useState(initialConsent === null)
  const [expanded, setExpanded] = useState(false)
  const [analyticsChecked, setAnalyticsChecked] = useState(initialConsent?.analytics ?? true)

  function persist(analytics: boolean) {
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
      serializeConsentCookie(analytics),
    )}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`
    setDecided(true)
    setOpen(false)
    setExpanded(false)
    router.refresh()
  }

  function reopen() {
    setExpanded(true)
    setOpen(true)
  }

  if (open) {
    return (
      <ConsentBanner
        expanded={expanded}
        analyticsChecked={analyticsChecked}
        onExpand={() => setExpanded(true)}
        onAnalyticsChange={setAnalyticsChecked}
        onAcceptAll={() => persist(true)}
        onReject={() => persist(false)}
        onSave={() => persist(analyticsChecked)}
      />
    )
  }

  if (decided) {
    return <ConsentPreferencesButton onClick={reopen} />
  }

  return null
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/unit/components/ConsentManager.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ConsentBanner/ConsentManager.tsx tests/unit/components/ConsentManager.test.tsx
git commit -m "feat: add consent manager orchestrator component"
```

---

### Task 5: Wire into layout.tsx — gate GA4, render ConsentManager

**Files:**
- Modify: `src/app/(frontend)/[locale]/layout.tsx`
- Test: `tests/unit/app/consent-layout.test.ts` (logic-only test of the gating condition, since the full layout is an async Server Component that's already covered indirectly by e2e — see Task 6)

**Interfaces:**
- Consumes: `CONSENT_COOKIE_NAME`, `parseConsentCookie` from `@/utilities/consent` (Task 1); `ConsentManager` from `@/components/ConsentBanner/ConsentManager` (Task 4).
- Produces: the layout now only renders GA4 `<Script>` tags when `gaId` is set **and** the parsed cookie has `analytics: true`.

This task has no isolated unit test for the JSX itself (Server Components with `cookies()` need integration/e2e coverage — see Task 6). Instead, Step 1 pins the gating boolean logic itself, which is the part that's easy to get backwards (e.g. accidentally defaulting to showing GA4 when consent is undecided).

- [ ] **Step 1: Write the failing test for the gating logic**

```typescript
// tests/unit/app/consent-layout.test.ts
import { describe, expect, it } from 'vitest'
import { parseConsentCookie } from '@/utilities/consent'

// Mirrors the boolean layout.tsx computes from `gaId` + the parsed cookie.
function shouldLoadGA4(gaId: string | undefined, rawCookie: string | undefined): boolean {
  const consent = parseConsentCookie(rawCookie)
  return Boolean(gaId) && consent?.analytics === true
}

describe('GA4 consent gating logic', () => {
  it('does not load GA4 when there is no gaId configured', () => {
    expect(shouldLoadGA4(undefined, JSON.stringify({ analytics: true, timestamp: 'x' }))).toBe(false)
  })

  it('does not load GA4 when consent has not been decided', () => {
    expect(shouldLoadGA4('G-TEST', undefined)).toBe(false)
  })

  it('does not load GA4 when analytics was rejected', () => {
    expect(shouldLoadGA4('G-TEST', JSON.stringify({ analytics: false, timestamp: 'x' }))).toBe(false)
  })

  it('loads GA4 when a gaId is configured and analytics was accepted', () => {
    expect(shouldLoadGA4('G-TEST', JSON.stringify({ analytics: true, timestamp: 'x' }))).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/app/consent-layout.test.ts`
Expected: FAIL — this specific test file doesn't exist yet, so it fails to be collected; write it first, confirm it runs and passes trivially against the local `shouldLoadGA4` helper (it doesn't depend on layout.tsx directly), then proceed to wire the same logic into layout.tsx in Step 3.

- [ ] **Step 3: Modify `layout.tsx`**

Add imports (near the existing `next/headers` import for `draftMode`):

```typescript
import { cookies, draftMode } from 'next/headers'
```

Add after the existing `ConsentBanner`-adjacent imports (alongside `AdminBar`, `GAListener`):

```typescript
import { ConsentManager } from '@/components/ConsentBanner/ConsentManager'
import { CONSENT_COOKIE_NAME, parseConsentCookie } from '@/utilities/consent'
```

Inside `LocaleLayout`, after the existing `const { isEnabled } = await draftMode()` line, add:

```typescript
  const cookieStore = await cookies()
  const consent = parseConsentCookie(cookieStore.get(CONSENT_COOKIE_NAME)?.value)
  const hasAnalyticsConsent = consent?.analytics === true
```

Change the GA4 gating condition from `{gaId && (` to:

```tsx
        {gaId && hasAnalyticsConsent && (
```

Render `ConsentManager` in the body, alongside `GAListener` (order doesn't matter functionally, but keep analytics-related client components grouped):

```tsx
            <GAListener />
            <ConsentManager initialConsent={consent} />
```

- [ ] **Step 4: Run the gating-logic test again to confirm it still passes**

Run: `pnpm vitest run tests/unit/app/consent-layout.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Run the full unit suite to catch regressions**

Run: `pnpm vitest run`
Expected: PASS — all existing tests plus the new ones from Tasks 1–5 (no failures introduced in `layout.tsx` consumers)

- [ ] **Step 6: Commit**

```bash
git add "src/app/(frontend)/[locale]/layout.tsx" tests/unit/app/consent-layout.test.ts
git commit -m "feat: gate GA4 script loading behind analytics consent"
```

---

### Task 6: End-to-end coverage

**Files:**
- Create: `tests/e2e/consent-banner.e2e.spec.ts`

**Interfaces:**
- Consumes: the running dev/preview server at `http://localhost:3000` (same pattern as `tests/e2e/frontend.e2e.spec.ts`), the `ak_consent` cookie name from Task 1's constant (hardcoded here as `'ak_consent'` to keep the e2e spec dependency-free from `src/`, matching how other e2e specs use plain selectors/strings rather than importing app code).

- [ ] **Step 1: Write the e2e spec**

```typescript
// tests/e2e/consent-banner.e2e.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Consent banner', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('shows the banner and no GA4 script when there is no prior consent', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByRole('region', { name: /cookie consent|consentimiento/i })).toBeVisible()
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(0)
  })

  test('accepting all loads the GA4 script and hides the banner', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /accept all|aceptar todo/i }).click()

    await expect(page.getByRole('region', { name: /cookie consent|consentimiento/i })).toBeHidden()
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(1)

    const cookie = (await page.context().cookies()).find((c) => c.name === 'ak_consent')
    expect(cookie).toBeDefined()
    expect(JSON.parse(decodeURIComponent(cookie?.value ?? '')).analytics).toBe(true)
  })

  test('rejecting keeps GA4 out and shows the floating preferences button', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /^reject$|^rechazar$/i }).click()

    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(0)
    await expect(page.getByRole('button', { name: /cookie preferences|preferencias de cookies/i })).toBeVisible()
  })

  test('reopening from the floating button and re-accepting loads GA4', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /^reject$|^rechazar$/i }).click()

    await page.getByRole('button', { name: /cookie preferences|preferencias de cookies/i }).click()
    await page.getByRole('switch', { name: /analytics|anal[ií]ticas/i }).click()
    await page.getByRole('button', { name: /save preferences|guardar preferencias/i }).click()

    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(1)
  })
})
```

- [ ] **Step 2: Run the e2e spec against a local build**

Run: `pnpm build && pnpm start &` then `pnpm test:e2e tests/e2e/consent-banner.e2e.spec.ts`
Expected: PASS (4 tests) — requires `NEXT_PUBLIC_GA_ID`/`settings.googleAnalyticsId` to be configured in the local/test DB seed for the GA4-script assertions to be meaningful; if the seeded `settings` global has no `googleAnalyticsId`, the "accept all loads the GA4 script" and "reopening... loads GA4" tests will fail on the script-count assertion — check `src/endpoints/seed` for the seeded `googleAnalyticsId` value before running, and seed one if absent (this is a pre-existing environment concern, not something this plan introduces).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/consent-banner.e2e.spec.ts
git commit -m "test: add e2e coverage for the consent banner flow"
```

---

### Task 7: Redesign — bottom-right card, category tooltips, cookie policy link

> Validated via an interactive mockup with the user before this task was written (bottom-right floating card, bottom-left reopen button, button order, tooltip behavior, link placement) — see the "UI" section of `design.md`, which was updated to reflect this after approval. This task rebuilds `ConsentBanner.tsx` and `styles.css` (both from Task 3) to match; `ConsentManager.tsx` (Task 4) and `layout.tsx` (Task 5) are unaffected — this is a markup/styling task, not a state/logic change, and the `ConsentBanner` prop contract stays identical.

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/es.json`
- Create: `src/components/ConsentBanner/InfoTooltip.tsx`
- Test: `tests/unit/components/InfoTooltip.test.tsx`
- Modify: `src/components/ConsentBanner/ConsentBanner.tsx`
- Modify: `src/components/ConsentBanner/styles.css`
- Modify: `tests/unit/components/ConsentBanner.test.tsx` (add tests only — the 7 existing tests must keep passing unmodified, since `ConsentBanner`'s prop contract does not change)

**Interfaces:**
- Consumes: nothing new from other tasks. `ConsentBanner`'s props stay exactly `{ expanded, analyticsChecked, onExpand, onAnalyticsChange, onAcceptAll, onReject, onSave }` (Task 3's contract) — `ConsentManager.tsx` (Task 4) needs no changes.
- Produces: `InfoTooltip` component, props `{ id: string; label: string; description: string }` — `id` is the DOM id shared between the trigger's `aria-describedby` and the tooltip span, `label` is the trigger's `aria-label` (the accessible name, since the trigger has no visible text), `description` is the tooltip's one-sentence body text.

- [ ] **Step 1: Add new i18n keys to `src/messages/en.json`**

Add these 5 keys inside the existing top-level `consent` object (alongside `ariaLabel`, `description`, etc. from Task 2):

```json
"cookiePolicyLabel": "Cookie Policy",
"necessaryDescription": "Required for the site to work — language, admin session, preview mode. Can't be turned off.",
"analyticsDescription": "Google Analytics — helps us understand how the site is used. Off by default.",
"necessaryInfoLabel": "More about necessary cookies",
"analyticsInfoLabel": "More about analytics cookies"
```

- [ ] **Step 2: Add the matching keys to `src/messages/es.json`**

```json
"cookiePolicyLabel": "Política de Cookies",
"necessaryDescription": "Necesarias para que el sitio funcione — idioma, sesión de admin, modo de vista previa. No se pueden desactivar.",
"analyticsDescription": "Google Analytics — nos ayuda a entender cómo se usa el sitio. Desactivadas por defecto.",
"necessaryInfoLabel": "Más información sobre cookies necesarias",
"analyticsInfoLabel": "Más información sobre cookies de analítica"
```

- [ ] **Step 3: Verify both message files are still valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json')); JSON.parse(require('fs').readFileSync('src/messages/es.json')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Write the failing test for `InfoTooltip`**

```tsx
// tests/unit/components/InfoTooltip.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { InfoTooltip } from '@/components/ConsentBanner/InfoTooltip'

describe('InfoTooltip', () => {
  afterEach(cleanup)

  it('renders a trigger with the given accessible label and a tooltip with the description, linked via aria-describedby', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    expect(trigger).toHaveAttribute('aria-describedby', 'test-tooltip')

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveAttribute('id', 'test-tooltip')
    expect(tooltip).toHaveTextContent('X is used for Y.')
  })

  it('adds the start-placement class when the tooltip would overflow the left edge', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    const tooltip = screen.getByRole('tooltip')

    // jsdom's getBoundingClientRect returns all-zero rects by default, so
    // rect.left (0) is always < the 8px margin — this deterministically
    // exercises the "start" placement branch without needing a manual mock.
    fireEvent.focus(trigger)
    expect(tooltip).toHaveClass('bp-tooltip--start')
  })

  it('recomputes placement to end when the tooltip would overflow the right edge', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    const tooltip = screen.getByRole('tooltip')

    const originalGetBoundingClientRect = tooltip.getBoundingClientRect.bind(tooltip)
    tooltip.getBoundingClientRect = () =>
      ({ ...originalGetBoundingClientRect(), left: 100, right: 5000, top: 100 }) as DOMRect
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })

    fireEvent.mouseEnter(trigger)
    expect(tooltip).toHaveClass('bp-tooltip--end')
  })

  it('closes on Escape by blurring the trigger', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    trigger.focus()
    expect(trigger).toHaveFocus()
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).not.toHaveFocus()
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/components/InfoTooltip.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ConsentBanner/InfoTooltip'`

- [ ] **Step 6: Write `InfoTooltip.tsx`**

```tsx
// src/components/ConsentBanner/InfoTooltip.tsx
'use client'

import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'

type Props = {
  id: string
  label: string
  description: string
}

const PLACEMENT_CLASSES = ['bp-tooltip--start', 'bp-tooltip--end', 'bp-tooltip--below']
const EDGE_MARGIN = 8

export function InfoTooltip({ id, label, description }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  function place() {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    tooltip.classList.remove(...PLACEMENT_CLASSES)

    let rect = tooltip.getBoundingClientRect()
    if (rect.left < EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--start')
    } else if (rect.right > window.innerWidth - EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--end')
    }

    rect = tooltip.getBoundingClientRect()
    if (rect.top < EDGE_MARGIN) {
      tooltip.classList.add('bp-tooltip--below')
    }
  }

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    function handlePointerDown(e: PointerEvent) {
      if (!wrap?.contains(e.target as Node)) {
        const trigger = wrap?.querySelector<HTMLButtonElement>('.bp-tooltip-trigger')
        if (trigger && document.activeElement === trigger) trigger.blur()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') e.currentTarget.blur()
  }

  return (
    <span
      className="bp-tooltip-wrap"
      ref={wrapRef}
    >
      <button
        type="button"
        className="bp-tooltip-trigger"
        aria-label={label}
        aria-describedby={id}
        onMouseEnter={place}
        onFocus={place}
        onKeyDown={handleKeyDown}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <line
            x1="12"
            y1="11"
            x2="12"
            y2="16"
          />
          <circle
            cx="12"
            cy="8"
            r="0.5"
            fill="currentColor"
          />
        </svg>
      </button>
      <span
        className="bp-tooltip"
        role="tooltip"
        id={id}
        ref={tooltipRef}
      >
        {description}
      </span>
    </span>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/components/InfoTooltip.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 8: Rewrite `ConsentBanner.tsx`**

Replace the full file content with:

```tsx
// src/components/ConsentBanner/ConsentBanner.tsx
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { InfoTooltip } from './InfoTooltip'
import './styles.css'

type Props = {
  expanded: boolean
  analyticsChecked: boolean
  onExpand: () => void
  onAnalyticsChange: (checked: boolean) => void
  onAcceptAll: () => void
  onReject: () => void
  onSave: () => void
}

export function ConsentBanner({
  expanded,
  analyticsChecked,
  onExpand,
  onAnalyticsChange,
  onAcceptAll,
  onReject,
  onSave,
}: Props) {
  const t = useTranslations('consent')

  return (
    <section
      className="ak-consent-card"
      aria-label={t('ariaLabel')}
    >
      <p className="ak-consent-card__text">
        {t('description')}{' '}
        <Link
          className="ak-consent-card__link"
          href="/cookie-policy"
        >
          {t('cookiePolicyLabel')}
        </Link>
      </p>

      {!expanded ? (
        <div className="ak-consent-card__actions">
          <button
            className="ak-consent-card__reject bp-btn"
            type="button"
            onClick={onReject}
          >
            {t('reject')}
          </button>
          <button
            className="ak-consent-card__icon-btn bp-btn bp-btn--secondary"
            type="button"
            aria-label={t('preferences')}
            title={t('preferences')}
            onClick={onExpand}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 1 1.6.3 6 6 0 0 1-8.1 8.1l-6.2 6.2a1.5 1.5 0 0 1-2.1-2.1l6.2-6.2a6 6 0 0 1 8.1-8.1 1 1 0 0 1 .3 1.6z" />
            </svg>
          </button>
          <button
            className="bp-btn"
            type="button"
            onClick={onAcceptAll}
          >
            {t('acceptAll')}
          </button>
        </div>
      ) : (
        <div className="ak-consent-card__preferences">
          <div className="ak-consent-card__toggle-row">
            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('necessaryLabel')}
                aria-checked={true}
                checked
                disabled
                readOnly
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('necessaryLabel')}</span>
            </label>
            <InfoTooltip
              id="consent-necessary-tooltip"
              label={t('necessaryInfoLabel')}
              description={t('necessaryDescription')}
            />
          </div>

          <div className="ak-consent-card__toggle-row">
            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('analyticsLabel')}
                aria-checked={analyticsChecked}
                checked={analyticsChecked}
                onChange={(e) => onAnalyticsChange(e.target.checked)}
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('analyticsLabel')}</span>
            </label>
            <InfoTooltip
              id="consent-analytics-tooltip"
              label={t('analyticsInfoLabel')}
              description={t('analyticsDescription')}
            />
          </div>

          <button
            className="bp-btn"
            type="button"
            onClick={onSave}
          >
            {t('save')}
          </button>
        </div>
      )}
    </section>
  )
}
```

Note: `t('preferences')` (Task 2's existing key) is now used as the icon button's `aria-label`/`title` instead of visible text — this is why the 7 existing `ConsentBanner.test.tsx` tests (which query `getByRole('button', { name: 'preferences' })`) keep passing unmodified: Testing Library resolves the accessible name from `aria-label` the same way it would from text content.

- [ ] **Step 9: Rewrite `styles.css`**

Replace the full file content with:

```css
/* src/components/ConsentBanner/styles.css */

/* ── Card — bottom-right, floating ───────────────────────────── */
.ak-consent-card {
  position: fixed;
  right: var(--bp-space-6, 1.5rem);
  bottom: var(--bp-space-6, 1.5rem);
  z-index: var(--consent-banner-z-index, 50);
  width: min(23rem, calc(100vw - 2 * var(--bp-space-4, 1rem)));
  background: var(--consent-banner-background, var(--bp-color-surface, #fff));
  border: 1px solid var(--bp-color-border);
  border-radius: var(--bp-radius-lg, 0.75rem);
  box-shadow: var(--bp-shadow-xl, var(--bp-shadow-lg));
  padding: var(--bp-space-6, 1.5rem);
}

.ak-consent-card__text {
  margin: 0 0 var(--bp-space-4, 1rem);
  color: var(--bp-color-text-muted, var(--bp-color-text));
  font-size: 0.875rem;
  line-height: 1.5;
}

.ak-consent-card__link {
  color: var(--bp-color-text);
  text-decoration: underline;
  text-decoration-color: var(--bp-color-border);
  text-underline-offset: 0.2em;
}
.ak-consent-card__link:hover {
  text-decoration-color: currentColor;
}

.ak-consent-card__actions,
.ak-consent-card__preferences {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--bp-space-2, 0.5rem) var(--bp-space-3, 0.75rem);
}

.ak-consent-card__preferences {
  flex-direction: column;
  align-items: stretch;
}

.ak-consent-card__preferences .bp-btn {
  align-self: flex-end;
}

.ak-consent-card__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Reject: intentionally low-emphasis — plain text, no fill, no accent
   color, no directional cue (that visual weight is reserved for the
   forward/CTA action, "Accept all"). */
.ak-consent-card__reject {
  background: transparent;
  color: var(--bp-color-text-muted);
  border: none;
  padding-inline: var(--bp-space-1, 0.25rem);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.2em;
}
.ak-consent-card__reject:hover {
  color: var(--bp-color-text);
  text-decoration-color: var(--bp-color-text-muted);
}

.ak-consent-card__icon-btn {
  flex: 0 0 auto;
  width: 2.5rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ak-consent-card__icon-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* ── Reopen button — bottom-left (unchanged position, opposite
   corner from the card so they never overlap) ───────────────── */
.ak-consent-reopen-btn {
  position: fixed;
  inset-inline-start: var(--bp-space-4, 1rem);
  bottom: var(--bp-space-4, 1rem);
  z-index: var(--consent-banner-z-index, 50);
}

/* ── Category info tooltip ───────────────────────────────────── */
.bp-tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.bp-tooltip-trigger {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--bp-color-text-muted);
  cursor: help;
  padding: 0;
}
.bp-tooltip-trigger svg {
  width: 0.9375rem;
  height: 0.9375rem;
}
.bp-tooltip-trigger:hover,
.bp-tooltip-trigger:focus-visible {
  color: var(--bp-color-text);
}

.bp-tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) translateY(0.25rem);
  width: max-content;
  max-width: min(18.75rem, 80vw);
  background: var(--bp-color-text);
  color: var(--bp-color-surface, #fff);
  font-size: 0.75rem;
  line-height: 1.4;
  padding: 0.5rem 0.625rem;
  border-radius: var(--bp-radius-md, 0.5rem);
  box-shadow: var(--bp-shadow-lg);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    visibility 0s linear 0.15s;
  pointer-events: none;
  z-index: 5;
}
.bp-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 0.3125rem solid transparent;
  border-top-color: var(--bp-color-text);
}

/* Hover: 300ms delay before revealing, so an accidental cursor graze
   across the trigger doesn't fire it. Focus (keyboard tab, or a tap
   that lands and holds focus): reveal immediately. */
.bp-tooltip-wrap:hover .bp-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  transition-delay: 0.3s, 0.3s, 0.3s;
}
.bp-tooltip-wrap:focus-within .bp-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  transition-delay: 0s, 0s, 0s;
}

.bp-tooltip--start {
  left: 0;
  transform: translateX(0) translateY(0.25rem);
}
.bp-tooltip-wrap:hover .bp-tooltip--start,
.bp-tooltip-wrap:focus-within .bp-tooltip--start {
  transform: translateX(0) translateY(0);
}
.bp-tooltip--start::after {
  left: 0.75rem;
  transform: none;
}

.bp-tooltip--end {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(0.25rem);
}
.bp-tooltip-wrap:hover .bp-tooltip--end,
.bp-tooltip-wrap:focus-within .bp-tooltip--end {
  transform: translateX(0) translateY(0);
}
.bp-tooltip--end::after {
  left: auto;
  right: 0.75rem;
  transform: none;
}

.bp-tooltip--below {
  bottom: auto;
  top: calc(100% + 0.5rem);
}
.bp-tooltip--below::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: var(--bp-color-text);
}
```

- [ ] **Step 10: Run the existing `ConsentBanner.test.tsx` suite to confirm all 7 tests still pass unmodified**

Run: `pnpm vitest run tests/unit/components/ConsentBanner.test.tsx`
Expected: PASS (7/7) — the prop contract and all `getByRole` queries are unaffected by this markup/CSS rewrite.

- [ ] **Step 11: Add new tests to `tests/unit/components/ConsentBanner.test.tsx`**

Append these tests inside the existing `describe('ConsentBanner', ...)` block (after the last existing test, before the closing `})`):

```tsx
  it('renders a Cookie Policy link pointing at /cookie-policy', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    const link = screen.getByRole('link', { name: 'cookiePolicyLabel' })
    expect(link).toHaveAttribute('href', '/cookie-policy')
  })

  it('renders category info tooltip triggers with distinct accessible labels when expanded', () => {
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'necessaryInfoLabel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'analyticsInfoLabel' })).toBeInTheDocument()
  })

  it('does not render category info tooltips when collapsed', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: 'necessaryInfoLabel' })).not.toBeInTheDocument()
  })
```

Add the import for `screen`'s `getByRole('link', ...)` support — no new imports needed, `@testing-library/react`'s existing `render`/`screen`/`fireEvent` cover this (a rendered `next/link` `<a>` element resolves to the `link` role automatically).

- [ ] **Step 12: Run the full `ConsentBanner.test.tsx` file to verify all tests (7 existing + 3 new) pass**

Run: `pnpm vitest run tests/unit/components/ConsentBanner.test.tsx`
Expected: PASS (10/10)

- [ ] **Step 13: Run the full unit suite to catch regressions**

Run: `pnpm vitest run`
Expected: PASS — no regressions in `ConsentManager.test.tsx`, `consent-layout.test.ts`, or any other file (this task did not touch `ConsentManager.tsx`, `ConsentPreferencesButton.tsx`, `consent.ts`, or `layout.tsx`)

- [ ] **Step 14: Run the e2e suite against a real build to confirm the visual redesign didn't break the underlying flow**

Run: `pnpm build && pnpm start &` (or reuse an already-running build if one is current), then `pnpm test:e2e tests/e2e/consent-banner.e2e.spec.ts`
Expected: PASS (4/4) — the e2e spec queries by role/name (`region`, `button`, `switch`), not by CSS class or position, so it should be unaffected by the visual redesign; this step is the proof that claim holds.

- [ ] **Step 15: Commit**

```bash
git add src/messages/en.json src/messages/es.json src/components/ConsentBanner/InfoTooltip.tsx src/components/ConsentBanner/ConsentBanner.tsx src/components/ConsentBanner/styles.css tests/unit/components/InfoTooltip.test.tsx tests/unit/components/ConsentBanner.test.tsx
git commit -m "feat: redesign consent banner as bottom-right card with category tooltips"
```

---

## Out of scope for this plan (per design.md)

- Privacy Policy / Cookie Policy pages in Payload.
- Opt-in checkbox on lead-gen forms.
- Server-side consent logging collection.
- Marketing/ads consent category.

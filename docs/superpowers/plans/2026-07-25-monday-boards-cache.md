# Monday Boards Cache Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache the Monday.com account's board/group/column schema on the `Settings` global (refreshed on demand), and use that cache to (a) show a copyable columns reference panel when building a Monday-integrated `Form`, and (b) flag `Form`s whose configured columns no longer exist on their board.

**Architecture:** A new `mondayBoardsCache` JSON field on the `Settings` global stores the last-synced snapshot. A `POST` endpoint on `Settings` (`/api/globals/settings/sync-monday-boards`) calls Monday's GraphQL API using the existing `mondayApiToken` field and overwrites the cache on success only. Three new Payload `ui`-type admin field components consume that cache: a refresh button + status on `Settings`, a connected-forms drift list on `Settings`, and a read-only columns reference panel on `Form`'s sidebar (via the existing `formOverrides.fields` hook in `src/plugins/index.ts`).

**Tech Stack:** Payload CMS 3 (globals, custom endpoints, `ui` field type, custom admin field components), React (`@payloadcms/ui`'s `useField`), Vitest + Testing Library.

## Global Constraints

- Follow the CSS/DS token rules and repository pattern only where relevant — this feature has no new CSS or external HTTP repository beyond the existing Monday call pattern already used by `MondayRepository`/`GenericMondayRepository`.
- After any schema change, run `pnpm generate:types` then `pnpm generate:importmap` (per `AGENTS.md`/project `CLAUDE.md`).
- Always pass `req` to nested Payload operations inside hooks/endpoints (transaction safety).
- Field-level `access` functions must return only `boolean`.
- Drift detection is informational only — never blocks saving a `Form`, never runs as a `beforeChange` hook (per the approved design spec, `docs/superpowers/specs/2026-07-25-monday-boards-cache-design.md`).
- Out of scope: detecting a column that changed *type* without being deleted; "click to add field" automation; a dedicated non-public collection for the cache.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/utilities/detectMondayDrift.ts` | Pure function: given a form's board id + field column ids and a cache snapshot, returns which column ids no longer exist. |
| `src/Settings/endpoints/syncBoards.ts` | `POST` endpoint: fetches boards/groups/columns from Monday's GraphQL API using `settings.mondayApiToken`, writes `mondayBoardsCache`. |
| `src/Settings/config.ts` (modify) | Add `mondayBoardsCache` (json), `mondayBoardsSyncUi` (ui), `mondayConnectedFormsUi` (ui) fields; register `syncBoards` endpoint. |
| `src/Settings/components/MondayBoardsSync.tsx` | Client component: "Last synced" text + "Refresh Monday Boards" button. |
| `src/Settings/components/MondayConnectedForms.tsx` | Client component: lists `forms` with `integrationTarget: 'monday'`, flags drift via `detectMondayDrift`. |
| `src/plugins/components/MondayColumnsReference.tsx` | Client component: read-only table of the selected board's columns (title, type, copyable id). |
| `src/plugins/index.ts` (modify) | Add `mondayColumnsReferenceUi` field to `formOverrides.fields`. |
| Migration (generated) | Schema change for the new `mondayBoardsCache` json column on `settings`. |

---

## Task 1: `detectMondayDrift` pure helper

**Files:**
- Create: `src/utilities/detectMondayDrift.ts`
- Test: `tests/unit/utilities/detectMondayDrift.test.ts`

**Interfaces:**
- Produces: `detectMondayDrift(form, cache)` → `{ boardFound: boolean; missingColumnIds: string[] }`. Types `MondayBoardCache`, `MondayBoardsCache` exported from this file — later tasks import them.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/unit/utilities/detectMondayDrift.test.ts
import { describe, expect, it } from 'vitest'
import { detectMondayDrift, type MondayBoardsCache } from '@/utilities/detectMondayDrift'

const cache: MondayBoardsCache = {
  syncedAt: '2026-07-25T00:00:00.000Z',
  boards: [
    {
      id: '4042731281',
      name: 'Contact Us - AK',
      groups: [{ id: 'topics', title: 'Group Title' }],
      columns: [
        { id: 'text', title: 'Name', type: 'name' },
        { id: 'email', title: 'Email', type: 'email' },
        { id: 'phone', title: 'Phone', type: 'phone' },
      ],
    },
  ],
}

describe('detectMondayDrift', () => {
  it('reports boardFound: false and no missing columns when there is no cache', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: 'email' }] },
      undefined,
    )
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports boardFound: false when the form has no board id set', () => {
    const result = detectMondayDrift({ externalId: null, fields: [{ externalId: 'email' }] }, cache)
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports boardFound: false when the board id is not in the cache', () => {
    const result = detectMondayDrift(
      { externalId: '999', fields: [{ externalId: 'email' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: false, missingColumnIds: [] })
  })

  it('reports no missing columns when every field externalId exists on the board', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: 'email' }, { externalId: 'phone' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: [] })
  })

  it('reports missing column ids that no longer exist on the board', () => {
    const result = detectMondayDrift(
      {
        externalId: '4042731281',
        fields: [{ externalId: 'email' }, { externalId: 'deleted_column' }],
      },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: ['deleted_column'] })
  })

  it('ignores fields with no externalId set', () => {
    const result = detectMondayDrift(
      { externalId: '4042731281', fields: [{ externalId: undefined }, { externalId: 'email' }] },
      cache,
    )
    expect(result).toEqual({ boardFound: true, missingColumnIds: [] })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/utilities/detectMondayDrift.test.ts`
Expected: FAIL — `Cannot find module '@/utilities/detectMondayDrift'`

- [ ] **Step 3: Write the implementation**

```ts
// src/utilities/detectMondayDrift.ts
export type MondayBoardColumn = {
  id: string
  title: string
  type: string
}

export type MondayBoardCache = {
  id: string
  name: string
  groups: Array<{ id: string; title: string }>
  columns: MondayBoardColumn[]
}

export type MondayBoardsCache = {
  syncedAt: string
  boards: MondayBoardCache[]
}

export type MondayDriftForm = {
  externalId?: string | null
  fields?: Array<{ externalId?: string | null }>
}

export type MondayDriftResult = {
  boardFound: boolean
  missingColumnIds: string[]
}

/**
 * Compares a form's board id + field column ids against a cached Monday
 * schema snapshot. Only detects columns that no longer exist at all — a
 * column that changed type without being deleted is out of scope (see
 * docs/superpowers/specs/2026-07-25-monday-boards-cache-design.md).
 */
export function detectMondayDrift(
  form: MondayDriftForm,
  cache: MondayBoardsCache | null | undefined,
): MondayDriftResult {
  if (!cache || !form.externalId) {
    return { boardFound: false, missingColumnIds: [] }
  }

  const board = cache.boards.find((b) => b.id === form.externalId)
  if (!board) {
    return { boardFound: false, missingColumnIds: [] }
  }

  const validColumnIds = new Set(board.columns.map((c) => c.id))
  const missingColumnIds = (form.fields ?? [])
    .map((f) => f.externalId)
    .filter((id): id is string => Boolean(id) && !validColumnIds.has(id))

  return { boardFound: true, missingColumnIds }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/utilities/detectMondayDrift.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utilities/detectMondayDrift.ts tests/unit/utilities/detectMondayDrift.test.ts
git commit -m "feat: add detectMondayDrift pure helper"
```

---

## Task 2: `syncBoards` endpoint

**Files:**
- Create: `src/Settings/endpoints/syncBoards.ts`
- Test: `tests/unit/Settings/endpoints/syncBoards.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1 directly (the endpoint writes `MondayBoardsCache`-shaped data but doesn't import the type to keep the endpoint decoupled from the utility — the shape is duplicated inline as a comment-documented literal, matching how `MondayBoardsCache` in Task 1 is structured).
- Produces: `syncBoardsEndpoint: Endpoint` (from `payload`), registered later in Task 3 as `Settings.endpoints`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/unit/Settings/endpoints/syncBoards.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'

const findGlobalMock = vi.fn()
const updateGlobalMock = vi.fn()

function fakeReq({ user = { id: 'staff-1' } }: { user?: unknown } = {}) {
  return {
    user,
    payload: { findGlobal: findGlobalMock, updateGlobal: updateGlobalMock },
  } as never
}

const mondayBoardsResponse = {
  data: {
    boards: [
      {
        id: '4042731281',
        name: 'Contact Us - AK',
        groups: [{ id: 'topics', title: 'Group Title' }],
        columns: [
          { id: 'text', title: 'Name', type: 'name' },
          { id: 'email', title: 'Email', type: 'email' },
        ],
      },
    ],
  },
}

describe('syncBoardsEndpoint', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns 401 when unauthenticated', async () => {
    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq({ user: null }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when no mondayApiToken is configured', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: '' })

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())
    expect(res.status).toBe(400)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })

  it('fetches boards from Monday and writes the cache on success', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => mondayBoardsResponse,
      }),
    )

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())
    const json = await res.json()

    expect(fetch).toHaveBeenCalledWith(
      'https://api.monday.com/v2',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'test-token' }),
      }),
    )
    expect(updateGlobalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'settings',
        data: {
          mondayBoardsCache: expect.objectContaining({
            boards: mondayBoardsResponse.data.boards,
            syncedAt: expect.any(String),
          }),
        },
      }),
    )
    expect(json.boards).toEqual(mondayBoardsResponse.data.boards)
  })

  it('returns 502 and does not touch the cache when Monday returns GraphQL errors', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ errors: [{ message: 'Invalid token' }] }),
      }),
    )

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())

    expect(res.status).toBe(502)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })

  it('returns 502 and does not touch the cache when the fetch itself throws', async () => {
    findGlobalMock.mockResolvedValue({ mondayApiToken: 'test-token' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const { syncBoardsEndpoint } = await import('@/Settings/endpoints/syncBoards')
    const res = await syncBoardsEndpoint.handler(fakeReq())

    expect(res.status).toBe(502)
    expect(updateGlobalMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/Settings/endpoints/syncBoards.test.ts`
Expected: FAIL — `Cannot find module '@/Settings/endpoints/syncBoards'`

- [ ] **Step 3: Write the implementation**

```ts
// src/Settings/endpoints/syncBoards.ts
import type { Endpoint } from 'payload'

const MONDAY_API_URL = 'https://api.monday.com/v2'

const BOARDS_QUERY = `query {
  boards (limit: 200) {
    id
    name
    groups { id title }
    columns { id title type }
  }
}`

type MondayBoardsQueryResponse = {
  data?: {
    boards: Array<{
      id: string
      name: string
      groups: Array<{ id: string; title: string }>
      columns: Array<{ id: string; title: string; type: string }>
    }>
  }
  errors?: Array<{ message: string }>
}

// Manual refresh for the Monday.com boards/groups/columns cache shown in
// Settings → Integrations. Never runs automatically — an admin clicks
// "Refresh Monday Boards". On any failure, the existing cache (and its
// syncedAt) is left untouched so the UI keeps showing the last-known-good
// snapshot instead of going blank.
export const syncBoardsEndpoint: Endpoint = {
  path: '/sync-monday-boards',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await req.payload.findGlobal({ slug: 'settings', req })
    const apiToken = settings.mondayApiToken

    if (!apiToken) {
      return Response.json(
        { error: 'No Monday.com API token configured in Settings → Integrations.' },
        { status: 400 },
      )
    }

    let body: MondayBoardsQueryResponse
    try {
      const res = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: apiToken },
        body: JSON.stringify({ query: BOARDS_QUERY }),
      })
      body = (await res.json()) as MondayBoardsQueryResponse
    } catch (err) {
      return Response.json(
        { error: `Failed to reach Monday.com: ${(err as Error).message}` },
        { status: 502 },
      )
    }

    if (body.errors?.length || !body.data) {
      return Response.json(
        { error: `Monday.com API error: ${body.errors?.map((e) => e.message).join(', ')}` },
        { status: 502 },
      )
    }

    const mondayBoardsCache = {
      syncedAt: new Date().toISOString(),
      boards: body.data.boards,
    }

    await req.payload.updateGlobal({
      slug: 'settings',
      data: { mondayBoardsCache },
      req,
    })

    return Response.json(mondayBoardsCache)
  },
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/Settings/endpoints/syncBoards.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/Settings/endpoints/syncBoards.ts tests/unit/Settings/endpoints/syncBoards.test.ts
git commit -m "feat: add syncBoards endpoint for the Monday boards cache"
```

---

## Task 3: Wire `mondayBoardsCache` field + endpoint into Settings, migrate

**Files:**
- Modify: `src/Settings/config.ts`
- Migration: generated by `pnpm payload migrate:create`

**Interfaces:**
- Consumes: `syncBoardsEndpoint` from Task 2.
- Produces: the `mondayBoardsCache` field now exists on the `Settings` global — later tasks' custom UI components read/write it via `useField({ path: 'mondayBoardsCache' })`. The `Settings` global's payload-generated type gains `mondayBoardsCache?: { syncedAt: string; boards: Array<{ id: string; name: string; groups: Array<{ id: string; title: string }>; columns: Array<{ id: string; title: string; type: string }> }> } | null`.

- [ ] **Step 1: Add the field and register the endpoint**

In `src/Settings/config.ts`, add the import at the top:

```ts
import { syncBoardsEndpoint } from './endpoints/syncBoards'
```

Add `endpoints: [syncBoardsEndpoint],` as a top-level property on the `Settings` object (alongside `slug`, `admin`, `access`, `hooks`, `fields`).

Add a new field inside the "Integrations" tab's `fields` array, immediately after the existing `mondayApiToken` field and before `defaultClaimIntegrationTarget`:

```ts
            {
              name: 'mondayBoardsCache',
              type: 'json',
              label: 'Monday.com Boards Cache',
              access: {
                read: authenticatedFieldAccess,
              },
              admin: {
                readOnly: true,
                description:
                  'Cached snapshot of Monday.com boards/groups/columns, refreshed via the button above. Only visible to logged-in admin users.',
              },
            },
```

- [ ] **Step 2: Regenerate types**

Run: `pnpm generate:types`
Expected: `src/payload-types.ts` gains a `mondayBoardsCache` field on the `Setting` interface, no errors.

- [ ] **Step 3: Create and run the migration**

Run: `pnpm payload migrate:create add_monday_boards_cache`
Expected: creates `src/migrations/<timestamp>_add_monday_boards_cache.ts` and its `.json` snapshot.

Run: `pnpm payload migrate`
Expected: `Migrated: <timestamp>_add_monday_boards_cache`

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/Settings/config.ts src/payload-types.ts src/migrations/
git commit -m "feat: add mondayBoardsCache field and sync endpoint to Settings"
```

---

## Task 4: `MondayBoardsSync` component (refresh button + status)

**Files:**
- Create: `src/Settings/components/MondayBoardsSync.tsx`
- Test: `tests/unit/Settings/MondayBoardsSync.test.tsx`
- Modify: `src/Settings/config.ts` (add the `ui` field)
- Modify: `src/app/(payload)/admin/importMap.js` (regenerated, not hand-edited)

**Interfaces:**
- Consumes: `MondayBoardsCache` type from `@/utilities/detectMondayDrift` (Task 1); the field path `mondayBoardsCache` from Task 3.
- Produces: nothing consumed by later tasks (self-contained UI).

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/Settings/MondayBoardsSync.test.tsx
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const setValueMock = vi.fn()
const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
}))

import { MondayBoardsSync } from '@/Settings/components/MondayBoardsSync'

describe('MondayBoardsSync', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows "Never synced" when the cache is empty', () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    render(<MondayBoardsSync />)
    expect(screen.getByText('Never synced')).toBeInTheDocument()
  })

  it('shows the last synced timestamp when a cache exists', () => {
    useFieldMock.mockReturnValue({
      value: { syncedAt: '2026-07-25T12:00:00.000Z', boards: [] },
      setValue: setValueMock,
    })
    render(<MondayBoardsSync />)
    expect(screen.getByText(/Last synced/)).toBeInTheDocument()
  })

  it('refreshes boards and updates the field value on success', async () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    const newCache = { syncedAt: '2026-07-25T13:00:00.000Z', boards: [] }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => newCache }),
    )

    render(<MondayBoardsSync />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Monday Boards' }))

    await waitFor(() => expect(setValueMock).toHaveBeenCalledWith(newCache))
    expect(fetch).toHaveBeenCalledWith(
      '/api/globals/settings/sync-monday-boards',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('shows an error message and does not update the field on failure', async () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Bad token' }) }),
    )

    render(<MondayBoardsSync />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Monday Boards' }))

    expect(await screen.findByText('Bad token')).toBeInTheDocument()
    expect(setValueMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/Settings/MondayBoardsSync.test.tsx`
Expected: FAIL — `Cannot find module '@/Settings/components/MondayBoardsSync'`

- [ ] **Step 3: Write the implementation**

```tsx
// src/Settings/components/MondayBoardsSync.tsx
'use client'

import { useField } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayBoardsSync: React.FC = () => {
  const { value, setValue } = useField<MondayBoardsCache | undefined>({
    path: 'mondayBoardsCache',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const refresh = async () => {
    setStatus('loading')
    setErrorMessage(undefined)

    try {
      const res = await fetch('/api/globals/settings/sync-monday-boards', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error ?? 'Failed to refresh Monday boards.')
        return
      }

      setValue(data)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage((err as Error).message)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <p style={{ margin: '0 0 0.5rem' }}>
        {value?.syncedAt ? `Last synced: ${new Date(value.syncedAt).toLocaleString()}` : 'Never synced'}
      </p>
      <button
        type="button"
        onClick={refresh}
        disabled={status === 'loading'}
        className="btn btn--style-secondary"
      >
        {status === 'loading' ? 'Refreshing…' : 'Refresh Monday Boards'}
      </button>
      {errorMessage && <p style={{ marginTop: '0.5rem', color: '#b91c1c' }}>{errorMessage}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/Settings/MondayBoardsSync.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Register the field in Settings config**

In `src/Settings/config.ts`, add immediately after the `mondayBoardsCache` field added in Task 3:

```ts
            {
              name: 'mondayBoardsSyncUi',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/Settings/components/MondayBoardsSync#MondayBoardsSync',
                },
              },
            },
```

- [ ] **Step 6: Regenerate the import map**

Run: `pnpm generate:importmap`
Expected: `src/app/(payload)/admin/importMap.js` gains an import + map entry for `MondayBoardsSync`.

- [ ] **Step 7: Type-check and commit**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

```bash
git add src/Settings/components/MondayBoardsSync.tsx tests/unit/Settings/MondayBoardsSync.test.tsx src/Settings/config.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat: add MondayBoardsSync refresh button to Settings"
```

---

## Task 5: `MondayConnectedForms` component (drift list)

**Files:**
- Create: `src/Settings/components/MondayConnectedForms.tsx`
- Test: `tests/unit/Settings/MondayConnectedForms.test.tsx`
- Modify: `src/Settings/config.ts` (add the `ui` field)

**Interfaces:**
- Consumes: `detectMondayDrift`, `MondayBoardsCache` from `@/utilities/detectMondayDrift` (Task 1); field path `mondayBoardsCache` (Task 3).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/Settings/MondayConnectedForms.test.tsx
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
}))

import { MondayConnectedForms } from '@/Settings/components/MondayConnectedForms'

describe('MondayConnectedForms', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows a prompt to sync when there is no cache yet', async () => {
    useFieldMock.mockReturnValue({ value: undefined })
    render(<MondayConnectedForms />)
    expect(
      await screen.findByText('Sync Monday boards above to check connected forms.'),
    ).toBeInTheDocument()
  })

  it('lists a form as up to date when all its columns exist on the board', async () => {
    useFieldMock.mockReturnValue({
      value: {
        syncedAt: '2026-07-25T00:00:00.000Z',
        boards: [
          {
            id: '4042731281',
            name: 'Contact Us - AK',
            groups: [],
            columns: [{ id: 'email', title: 'Email', type: 'email' }],
          },
        ],
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          docs: [
            {
              id: 1,
              title: 'Contact Form',
              externalId: '4042731281',
              fields: [{ externalId: 'email' }],
            },
          ],
        }),
      }),
    )

    render(<MondayConnectedForms />)

    expect(await screen.findByText('Contact Form')).toBeInTheDocument()
    expect(screen.getByText('✓ up to date')).toBeInTheDocument()
  })

  it('flags a form with missing columns', async () => {
    useFieldMock.mockReturnValue({
      value: {
        syncedAt: '2026-07-25T00:00:00.000Z',
        boards: [
          {
            id: '4042731281',
            name: 'Contact Us - AK',
            groups: [],
            columns: [{ id: 'email', title: 'Email', type: 'email' }],
          },
        ],
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          docs: [
            {
              id: 1,
              title: 'Contact Form',
              externalId: '4042731281',
              fields: [{ externalId: 'email' }, { externalId: 'deleted_col' }],
            },
          ],
        }),
      }),
    )

    render(<MondayConnectedForms />)

    expect(await screen.findByText(/deleted_col/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/Settings/MondayConnectedForms.test.tsx`
Expected: FAIL — `Cannot find module '@/Settings/components/MondayConnectedForms'`

- [ ] **Step 3: Write the implementation**

```tsx
// src/Settings/components/MondayConnectedForms.tsx
'use client'

import { useField } from '@payloadcms/ui'
import type React from 'react'
import { useEffect, useState } from 'react'
import { detectMondayDrift, type MondayBoardsCache } from '@/utilities/detectMondayDrift'

type ConnectedForm = {
  id: string | number
  title: string
  externalId?: string | null
  fields?: Array<{ externalId?: string | null }>
}

export const MondayConnectedForms: React.FC = () => {
  const { value: cache } = useField<MondayBoardsCache | undefined>({ path: 'mondayBoardsCache' })
  const [forms, setForms] = useState<ConnectedForm[] | undefined>()

  useEffect(() => {
    if (!cache) return
    let cancelled = false

    fetch('/api/forms?where[integrationTarget][equals]=monday&depth=0&limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setForms(data.docs ?? [])
      })

    return () => {
      cancelled = true
    }
  }, [cache])

  if (!cache) {
    return <p>Sync Monday boards above to check connected forms.</p>
  }

  if (!forms) {
    return <p>Loading connected forms…</p>
  }

  if (forms.length === 0) {
    return <p>No forms are currently connected to Monday.com.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {forms.map((form) => {
        const drift = detectMondayDrift(form, cache)
        return (
          <li key={form.id} style={{ margin: '0.5rem 0' }}>
            <a href={`/admin/collections/forms/${form.id}`}>{form.title}</a>
            {' — '}
            {!drift.boardFound ? (
              <span style={{ color: '#b91c1c' }}>⚠️ board not found in cache</span>
            ) : drift.missingColumnIds.length === 0 ? (
              <span style={{ color: '#15803d' }}>✓ up to date</span>
            ) : (
              <span style={{ color: '#b91c1c' }}>
                ⚠️ {drift.missingColumnIds.length} field(s) point to missing columns:{' '}
                {drift.missingColumnIds.join(', ')}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/Settings/MondayConnectedForms.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Register the field in Settings config**

In `src/Settings/config.ts`, add immediately after the `mondayBoardsSyncUi` field added in Task 4:

```ts
            {
              name: 'mondayConnectedFormsUi',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/Settings/components/MondayConnectedForms#MondayConnectedForms',
                },
              },
            },
```

- [ ] **Step 6: Regenerate the import map, type-check, and commit**

Run: `pnpm generate:importmap`
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

```bash
git add src/Settings/components/MondayConnectedForms.tsx tests/unit/Settings/MondayConnectedForms.test.tsx src/Settings/config.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat: add MondayConnectedForms drift list to Settings"
```

---

## Task 6: `MondayColumnsReference` panel on Forms

**Files:**
- Create: `src/plugins/components/MondayColumnsReference.tsx`
- Test: `tests/unit/plugins/MondayColumnsReference.test.tsx`
- Modify: `src/plugins/index.ts` (add the `ui` field to `formOverrides.fields`)

**Interfaces:**
- Consumes: `MondayBoardsCache` type from `@/utilities/detectMondayDrift` (Task 1); reads the `externalId` field's live value via `useField`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/plugins/MondayColumnsReference.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
}))

import { MondayColumnsReference } from '@/plugins/components/MondayColumnsReference'

describe('MondayColumnsReference', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('prompts to sync boards first when the settings fetch has no cache', async () => {
    useFieldMock.mockReturnValue({ value: '4042731281' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: undefined }) }),
    )

    render(<MondayColumnsReference />)

    expect(
      await screen.findByText('Sync Monday boards first in Settings → Integrations.'),
    ).toBeInTheDocument()
  })

  it('shows a not-found message when the entered board id has no match in the cache', async () => {
    useFieldMock.mockReturnValue({ value: '999' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [{ id: '4042731281', name: 'Contact Us - AK', groups: [], columns: [] }],
          },
        }),
      }),
    )

    render(<MondayColumnsReference />)

    expect(
      await screen.findByText(
        'No cached board matches this id — double check it, or refresh boards in Settings.',
      ),
    ).toBeInTheDocument()
  })

  it('renders the matching board columns with title, type, and copyable id', async () => {
    useFieldMock.mockReturnValue({ value: '4042731281' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [
              {
                id: '4042731281',
                name: 'Contact Us - AK',
                groups: [],
                columns: [{ id: 'email', title: 'Email', type: 'email' }],
              },
            ],
          },
        }),
      }),
    )

    render(<MondayColumnsReference />)

    expect(await screen.findByText('Email')).toBeInTheDocument()
    expect(screen.getByText('email', { selector: 'code' })).toBeInTheDocument()
  })

  it('renders nothing (no fetch) when no board id has been entered yet', () => {
    useFieldMock.mockReturnValue({ value: undefined })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    render(<MondayColumnsReference />)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/plugins/MondayColumnsReference.test.tsx`
Expected: FAIL — `Cannot find module '@/plugins/components/MondayColumnsReference'`

- [ ] **Step 3: Write the implementation**

```tsx
// src/plugins/components/MondayColumnsReference.tsx
'use client'

import { useField } from '@payloadcms/ui'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { MondayBoardCache, MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayColumnsReference: React.FC = () => {
  const { value: boardId } = useField<string | undefined>({ path: 'externalId' })
  const [cache, setCache] = useState<MondayBoardsCache | undefined | null>(null)

  useEffect(() => {
    if (!boardId) return
    let cancelled = false

    fetch('/api/globals/settings?depth=0')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCache(data.mondayBoardsCache)
      })

    return () => {
      cancelled = true
    }
  }, [boardId])

  if (!boardId) return null

  if (cache === null) return <p>Loading Monday columns…</p>

  if (!cache) {
    return <p>Sync Monday boards first in Settings → Integrations.</p>
  }

  const board: MondayBoardCache | undefined = cache.boards.find((b) => b.id === boardId)

  if (!board) {
    return <p>No cached board matches this id — double check it, or refresh boards in Settings.</p>
  }

  const copy = (text: string) => navigator.clipboard.writeText(text)

  return (
    <table style={{ width: '100%', fontSize: '0.875rem' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Column</th>
          <th style={{ textAlign: 'left' }}>Type</th>
          <th style={{ textAlign: 'left' }}>Id</th>
        </tr>
      </thead>
      <tbody>
        {board.columns.map((column) => (
          <tr key={column.id}>
            <td>{column.title}</td>
            <td>{column.type}</td>
            <td>
              <code>{column.id}</code>{' '}
              <button type="button" onClick={() => copy(column.id)}>
                Copy
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/unit/plugins/MondayColumnsReference.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Register the field in Forms sidebar**

In `src/plugins/index.ts`, inside `formOverrides.fields`'s `.concat([...])` array, add a new entry immediately after the existing `externalId` field object and before `mondayGroupId`:

```ts
            {
              name: 'mondayColumnsReferenceUi',
              type: 'ui',
              admin: {
                position: 'sidebar',
                condition: (data) => data?.integrationTarget === 'monday',
                components: {
                  Field: '@/plugins/components/MondayColumnsReference#MondayColumnsReference',
                },
              },
            },
```

- [ ] **Step 6: Regenerate the import map, type-check, and commit**

Run: `pnpm generate:importmap`
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

```bash
git add src/plugins/components/MondayColumnsReference.tsx tests/unit/plugins/MondayColumnsReference.test.tsx src/plugins/index.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat: add MondayColumnsReference panel to Form sidebar"
```

---

## Task 7: Full verification pass

- [ ] **Step 1: Run the full unit test suite**

Run: `pnpm vitest run tests/unit`
Expected: all tests pass, including the 6 new test files from Tasks 1–6.

- [ ] **Step 2: Full type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

Start the dev server (`pnpm dev`), log into `/admin`, go to Globals → Settings → Integrations tab:
- Confirm "Never synced" shows before the first refresh.
- Click "Refresh Monday Boards" — confirm boards populate and "Last synced" updates.
- Confirm the "Connected Forms" list renders below it.
- Open (or create) a `Form` with `integrationTarget: Monday.com`, paste a real board id (e.g. `4042731281` for "Contact Us - AK") into the board id field — confirm the columns reference table appears in the sidebar with copyable ids.

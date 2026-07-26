# Monday.com boards cache, connected-forms drift check, and column reference panel

## Context

Today, hooking a `Form` up to Monday.com requires an admin to know the board id, group id, and each column's internal id (`externalId`) by heart or by going to look them up in Monday itself — there's no reference inside `/admin`. There's also no way to tell, from `/admin`, whether a form that was wired up to Monday months ago still points at columns that still exist on that board (someone may have deleted or reorganized a column since).

This adds a small cached snapshot of the account's Monday schema (boards/groups/columns), refreshed on demand, and two places in `/admin` that consume it:
1. A reference panel on the `Form` editor showing the selected board's columns (name, type, copyable id).
2. A "Connected Forms" list on the `Settings` global flagging forms whose configured columns no longer exist on the board.

Explicitly out of scope (decided during design): detecting a column that changed *type* (e.g. text → status) without being deleted. The existing per-submission sync error handling (`dispatchFormSync.ts`'s try/catch, which marks a `form-submissions` doc `syncStatus: 'error'` with a `syncError` message from Monday's own GraphQL error) already surfaces that failure mode reactively, with no data loss — not worth the extra field/complexity to detect proactively unless it proves to be a recurring real problem.

## 1. Settings global — boards cache + refresh

New field on `Settings` (`src/Settings/config.ts`), in the existing "Integrations" tab, right after `mondayApiToken`:

- `mondayBoardsCache` — type `json`, same `access.read: authenticatedFieldAccess` gate as `mondayApiToken` (never exposed in the public Settings API response). Shape:
  ```ts
  {
    syncedAt: string // ISO timestamp
    boards: Array<{
      id: string
      name: string
      groups: Array<{ id: string; title: string }>
      columns: Array<{ id: string; title: string; type: string }>
    }>
  }
  ```
- Rendered via a custom admin UI field component (`MondayBoardsSync`, client component) instead of the raw JSON editor: shows "Last synced: <relative time>" (or "Never synced"), and a "Refresh Monday Boards" button.

### Endpoint

New Payload custom endpoint, `src/endpoints/monday/syncBoards.ts`:
- `POST /api/monday/sync-boards`
- `access`: authenticated admin only (mirrors the existing pattern — every `/admin` user is effectively an admin today, no role system exists yet)
- Reads `settings.mondayApiToken` (Local API, `overrideAccess: true`, same pattern as `MondayRepository.submit`), queries Monday's GraphQL API for `boards { id name groups { id title } columns { id title type } }` (limit ~100, matching what we already confirmed the account has ~90 boards), and writes the result plus a fresh `syncedAt` into `settings.mondayBoardsCache` via `payload.updateGlobal`.
- On failure (bad token, network error, Monday API error): returns a 4xx/5xx with the error message, and does **not** overwrite the existing cache — the UI keeps showing the last-known-good snapshot with its original `syncedAt`, plus a toast/error message from the failed attempt.
- Registered in `payload.config.ts`'s `endpoints` array.

### Connected Forms list

Second custom UI field component (`MondayConnectedForms`, client component) rendered below the sync button, still in the Integrations tab:
- Fetches `forms` where `integrationTarget === 'monday'` via the existing REST API (`/api/forms?where[integrationTarget][equals]=monday&depth=0`).
- For each form, reads its `externalId` (board id) and every field block's `externalId` (column id) present in `form.fields`.
- Cross-references against `mondayBoardsCache.boards` (matched by board id): a form is flagged with a ⚠️ if any of its field column ids is not present in that board's cached `columns` (or if the board id itself isn't in the cache at all — most likely because it was never synced, or the board was removed).
- Renders a simple list: form title (linking to `/admin/collections/forms/{id}`) + either "✓ up to date" or "⚠️ N field(s) point to missing columns: <ids>".
- Empty state: "Sync Monday boards above to check connected forms" when the cache has never been populated.

This check is purely informational — it does not block saving a Form, and does not run as a `beforeChange` hook. It only runs when an admin opens `/admin/globals/settings`.

## 2. Forms — Monday columns reference panel

New custom UI field component (`MondayColumnsReference`, client component) added to the `Form` sidebar fields (`formOverrides.fields` in `src/plugins/index.ts`), positioned right after the existing `externalId` (board id) field:

- `condition: (data) => data?.integrationTarget === 'monday'` (same as the existing `mondayGroupId` field)
- Reads the sibling `externalId` field's live value via Payload's `useFormFields` hook (no need to save the form first).
- Fetches the cached boards list — a small dedicated read is simplest: reuse `mondayBoardsCache` by fetching `/api/globals/settings` as an authenticated admin request (the field's own `authenticatedFieldAccess` gate already allows this for logged-in users) — and finds the entry whose `id` matches the entered board id.
- Renders a read-only table: column **title**, column **type**, and the column **id** in a monospace `<code>` block with a small "Copy" button (`navigator.clipboard.writeText`) — so the admin copies the exact id into each field's own `externalId` the same way they do today, just without guessing or retyping it by hand.
- Empty/error states:
  - No cache yet → "Sync Monday boards first in Settings → Integrations."
  - Board id doesn't match any cached board → "No cached board matches this id — double check it, or refresh boards in Settings."

This panel is purely a reference — it does not modify `form.fields`, and there is no "click to add a field" automation (considered and explicitly rejected during design: the panel's only job is to remove the guesswork/typos from manually copying an id, not to generate fields).

## Data flow (end to end)

1. Admin sets/updates `mondayApiToken` in Settings, clicks "Refresh Monday Boards" → `POST /api/monday/sync-boards` → `mondayBoardsCache` updated.
2. Admin opens a `Form`, sets `integrationTarget: monday`, pastes a board id into `externalId` → the reference panel shows that board's columns with copyable ids.
3. Admin builds the form's fields, pasting the matching column id into each field's own `externalId`.
4. Back in Settings, the "Connected Forms" list shows every Monday-integrated form and flags any whose field ids no longer resolve against the last-synced cache.

## Testing

- Unit test `syncBoards` endpoint logic (mocked `fetch` to Monday's API): writes cache on success; leaves existing cache untouched and surfaces the error on failure.
- Unit test a pure helper, e.g. `detectMondayDrift(form, cache)` (extracted so it's testable without mounting the admin UI component) — given a form's `externalId` + fields' `externalId`s and a cache snapshot, returns which column ids (if any) are missing.
- Component-level tests for `MondayColumnsReference` and `MondayConnectedForms` cover the empty/error states listed above, following the existing patterns in `tests/unit/components/`.

## Out of scope

- Detecting a column that changed type without being deleted (see Context above).
- "Click to add field" automation from the reference panel.
- Blocking Form save when drift is detected — this is informational only.
- A dedicated non-public collection for the cache — a single JSON field on the existing `Settings` global is enough for this data's size and access pattern.

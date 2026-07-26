# Machines data population — assets first, then fetch

Runbook for filling in the new `machines` fields (`specs`, `capabilities.items[].image`/`.heading`) plus any pending gallery/dimension assets from `Shared Folder/Maquinas por modelo/` once `feat/machine-pages-v2` (or its migration) ships to an environment with write access.

## Why this two-phase order

Payload rejects an `upload`/`relationship` field pointing at a media `id` that doesn't exist yet. Every field that references an image (`image`, `gallery[].image`, `capabilities.items[].image`, `dimensionDiagrams[].image`) needs the **media document to exist first**, so the id can be put into the machine's PATCH body. There is no single request that does both — it's always upload → get id → reference id.

## Environment note (local vs. prod)

Locally, the R2 credentials in `.env.local` are **read-only** — `pnpm dev` can render existing media but a local `POST /api/media` upload will fail. That's fine for local dev because every asset already committed under `public/seed-assets/` or already in the DB renders normally.

For **new** assets (Alpha capability shots, per-model dimension diagrams, additional gallery angles from `Shared Folder`), the upload step in Phase 1 below must run against an environment that has R2 write access — i.e. staging or production, pointed at via `TARGET_URL`. Don't try to run Phase 1 against `localhost`.

## Auth

`Users` uses Payload's default email/password auth (no API-key strategy configured). Get a JWT first:

```ts
const loginRes = await fetch(`${TARGET_URL}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const { token } = await loginRes.json()
const headers = { Authorization: `JWT ${token}` }
```

## Phase 1 — assets: upload once, cache the id by filename

```ts
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const mediaIdCache = new Map<string, number>() // filename -> media id, persist to a JSON file between runs

async function uploadAsset(filePath: string, alt: string): Promise<number> {
  const filename = basename(filePath)
  if (mediaIdCache.has(filename)) return mediaIdCache.get(filename)!

  // idempotency: check if it's already there before re-uploading
  const existing = await fetch(
    `${TARGET_URL}/api/media?where[filename][equals]=${encodeURIComponent(filename)}`,
    { headers },
  ).then((r) => r.json())
  if (existing.docs?.[0]?.id) {
    mediaIdCache.set(filename, existing.docs[0].id)
    return existing.docs[0].id
  }

  const form = new FormData()
  form.append('file', new Blob([await readFile(filePath)]), filename)
  form.append('alt', alt)

  const res = await fetch(`${TARGET_URL}/api/media`, { method: 'POST', headers, body: form })
  if (!res.ok) throw new Error(`upload failed for ${filename}: ${res.status} ${await res.text()}`)
  const { doc } = await res.json()
  mediaIdCache.set(filename, doc.id)
  return doc.id
}
```

Run this for every file you intend to attach, sourced from `Shared Folder/Maquinas por modelo/<MODEL>/`. Persist `mediaIdCache` to a JSON file (`filename → id`) after each run so re-running the script doesn't re-upload — the `where[filename][equals]` check above is a second safety net for the same reason.

## Phase 2 — data: find the machine by slug, PATCH it

```ts
async function getMachineIdBySlug(slug: string): Promise<number> {
  const res = await fetch(`${TARGET_URL}/api/machines?where[slug][equals]=${slug}`, { headers })
  const { docs } = await res.json()
  if (!docs[0]) throw new Error(`no machine with slug ${slug}`)
  return docs[0].id
}

async function patchMachine(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${TARGET_URL}/api/machines/${id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`patch failed for machine ${id}: ${res.status} ${await res.text()}`)
}

// Example — Alpha 10, specs pulled from Fichas Extraidas/ALPHA-10.md
const alpha10Id = await getMachineIdBySlug('alpha-10')
await patchMachine(alpha10Id, {
  specs: [
    { label: 'Dimensions (H×W×D)', value: '78.42" × 57.63" × 40.23"' },
    { label: 'Touchscreen', value: '49"' },
    { label: 'Storage capacity', value: '90–160 boxes' },
    { label: 'Heating cycle', value: '2–3 min, 360° bake' },
    { label: 'Refrigeration range', value: '4°C – 25°C' },
    { label: 'Payment methods', value: 'Cards, Apple Pay, Google Pay' },
  ],
  capabilities: {
    heading: 'Built for hot food. Designed for high traffic.',
    items: [
      {
        heading: 'From cold to 360° in under 3 minutes.',
        text: 'The built-in microwave/oven module runs a full 360° bake cycle.',
        image: await uploadAsset('.../oven-module-closeup.jpg', 'Alpha 10 oven module'),
      },
      // ...remaining bullets, only set `image` on the ones meant to render as a full-bleed band
    ],
  },
})
```

## Order of operations for the actual rollout

1. Merge/deploy `feat/machine-pages-v2` (schema + migration) to the target environment.
2. Run `pnpm payload migrate` on that environment if it doesn't run automatically on deploy.
3. Run Phase 1 (assets) against that environment's `TARGET_URL`, sourced from `Shared Folder/Maquinas por modelo/` and `Shared Folder/Fichas Extraidas/` for copy.
4. Run Phase 2 (data) per machine, using the cached media ids from step 3.
5. Spot-check each machine in `/admin` before it goes live — the `specs` labels must match verbatim across models in the same family, or the family-page comparison table's rows won't line up (see the `admin.description` on `machines.specs` in `src/collections/Machines/index.ts`).

## Not in scope here

This doc covers the fetch strategy only. It does not include a ready-to-run script wired to the actual `Shared Folder` file list — build that once the model/family page redesign (Option B) is actually implemented, so the `capabilities.items` split between "plain bullet" and "full-bleed band" is final and you're not uploading images twice.

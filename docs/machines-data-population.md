# Machines data population — assets first, then fetch

Runbook for filling in the new fields shipped by `feat/machine-pages-v2` (PR: family page redesign, model page hero, modal-capable CTAs) once it's deployed to an environment with R2 write access (staging or production).

## ⚠️ Known bug to work around: locale

**Every fetch/PATCH below writes to the default locale (`en`) only, unless you explicitly pass `?locale=es`.** None of the machines pages queries set a `fallbackLocale`, so a Spanish visitor sees a **blank field** for anything localized that wasn't separately populated in `es` — it does not fall back to the English value.

Localized fields affected by this PR: `machine-families.heroEyebrow`, `.heroHeading`, `.description`, `.tagline`, `.highlights.eyebrow/.heading/.items[].title/.description`; `machines.specs[].label/.value`, `.capabilities.heading/.items[].heading/.text`, `.cta.label/.url`, `.tagline`, `.heroEyebrow`.

**Do this for every PATCH in Phase 2:**
1. `PATCH /api/machine-families/:id?locale=en` with the English content.
2. `PATCH /api/machine-families/:id?locale=es` with the Spanish content (translate the copy — don't just repeat the English strings).
3. Same pattern for `/api/machines/:id`.

Skipping step 2 is the single most likely way this rollout ships broken — it won't error, it'll just render empty on `/es/machines/...`.

## Why assets-first

Payload rejects an `upload`/`relationship` field pointing at a media `id` that doesn't exist yet. Every field that references an image (`heroLineupImage`, `highlights.items[].image`, `capabilities.items[].image`, `gallery[].image`, `dimensionDiagrams[].image`) needs the **media document to exist first**, so the id can go into the PATCH body. Always: upload → get id → reference id.

## Asset checklist for this PR (what's currently a placeholder)

| Field | Where | Needed for | Suggested size |
|---|---|---|---|
| `machine-families.heroLineupImage` | Family hero | One composed, no-background render of the full model line-up per family (Alpha, Gamma, Delta, Zeta, Kappa) | ~2400×1200px, transparent bg |
| `machine-families.highlights.items[].image` | Family highlight cards | One photo per highlight bullet (currently reused placeholder brand photos in local test data) | 1200×960px (5:4), landscape |
| `machines.capabilities.items[].image` | Model page capability bands | Optional — only items you want as a full-bleed band need one; the rest render as plain bullets | 1600×1000px |

Everything else (machine `image`, `gallery`, `dimensionDiagrams`) already existed before this PR and doesn't need new assets unless you're adding new angles from `Shared Folder/Maquinas por modelo/`.

## Environment note (local vs. prod)

Locally, the R2 credentials in `.env.local` are **read-only** — `pnpm dev` renders existing media fine, but a local `POST /api/media` upload fails. New uploads must run against an environment with R2 write access (staging/production).

## Auth — two options

**Option A (fastest for a one-off): browser console, already logged into `/admin`.** Open `/admin` in the target environment, log in normally, open DevTools console on that tab, and run `fetch(...)` directly — the session cookie is sent automatically with `credentials: 'include'`. This is how the schema was smoke-tested locally for this PR. No token handling needed.

```js
// run directly in the browser console while logged into /admin
const res = await fetch('/api/machine-families?where[slug][equals]=alpha&depth=0', { credentials: 'include' })
const { docs } = await res.json()
```

**Option B (for a scripted/repeatable run): JWT login.**

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

## Phase 2 — data: find the doc, PATCH it once per locale

```ts
async function getMachineIdBySlug(slug: string): Promise<number> {
  const res = await fetch(`${TARGET_URL}/api/machines?where[slug][equals]=${slug}`, { headers })
  const { docs } = await res.json()
  if (!docs[0]) throw new Error(`no machine with slug ${slug}`)
  return docs[0].id
}

async function patchMachine(id: number, locale: 'en' | 'es', data: Record<string, unknown>) {
  const res = await fetch(`${TARGET_URL}/api/machines/${id}?locale=${locale}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`patch failed for machine ${id} (${locale}): ${res.status} ${await res.text()}`)
}

// Example — Alpha 10, specs pulled from Fichas Extraidas/ALPHA-10.md
const alpha10Id = await getMachineIdBySlug('alpha-10')

const specsEn = [
  { label: 'Dimensions (H×W×D)', value: '78.42" × 57.63" × 40.23"' },
  { label: 'Touchscreen', value: '49"' },
  { label: 'Storage capacity', value: '90–160 boxes' },
  { label: 'Heating cycle', value: '2–3 min, 360° bake' },
  { label: 'Refrigeration range', value: '4°C – 25°C' },
  { label: 'Payment methods', value: 'Cards, Apple Pay, Google Pay' },
]
// same labels (numbers don't need translation), but heading/text copy elsewhere DOES
await patchMachine(alpha10Id, 'en', { specs: specsEn })
await patchMachine(alpha10Id, 'es', { specs: specsEn })

await patchMachine(alpha10Id, 'en', {
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
await patchMachine(alpha10Id, 'es', {
  capabilities: {
    heading: 'Diseñado para comida caliente. Pensado para alto tráfico.',
    items: [
      {
        heading: 'De frío a 360° en menos de 3 minutos.',
        text: 'El módulo de microondas/horno integrado corre un ciclo de horneado 360° completo.',
        // same media id — no need to re-upload the image per locale
      },
    ],
  },
})
```

`cta` is the one field where the URL/label genuinely differ from content translation concerns — if `cta.type` is `'modal'`, `modalForm` is a relationship id (not localized) and only `label` needs a translated string per locale.

## Order of operations for the actual rollout

1. Merge/deploy `feat/machine-pages-v2` (schema + migrations) to the target environment.
2. Run `pnpm payload migrate` on that environment if it doesn't run automatically on deploy.
3. Run Phase 1 (assets) against that environment's `TARGET_URL`, sourced from `Shared Folder/Maquinas por modelo/` and `Shared Folder/Fichas Extraidas/` for copy.
4. Run Phase 2 (data) per machine/family, **once per locale** (see the locale warning above).
5. Spot-check both `/en/machines/...` and `/es/machines/...` in a browser before calling it done — not just `/admin`. The admin UI shows whichever locale tab you're editing; it's easy to fill in `en` and never notice `es` is blank.
6. `specs` labels must match verbatim across models in the same family (in whichever locale you're viewing), or the family-page comparison table's rows won't line up — see the `admin.description` on `machines.specs` in `src/collections/Machines/index.ts`.
7. If using a `cta.type: 'modal'`, confirm the referenced form in `forms` actually exists in that environment (form IDs aren't guaranteed to match between local/staging/prod).

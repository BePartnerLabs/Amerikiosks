# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Middleware

El middleware de Next.js vive en `src/proxy.ts` (no `middleware.ts`) — Next.js lo detecta igual por la configuración en `next.config.ts`.

Actualmente maneja solo i18n (`next-intl`). El matcher excluye `/admin`, `/api`, `/next`, assets estáticos y archivos con extensión.

## Commands

Non-obvious ones only — the rest are standard `package.json` scripts:

```bash
pnpm generate:types         # Regenerate payload-types.ts after schema changes
pnpm generate:importmap     # Regenerate admin import map after adding components
pnpm payload migrate:create # Create a new DB migration
pnpm payload migrate        # Run pending DB migrations — MUST run before pnpm start in prod
```

## Architecture

Payload and Next.js run in the same process. The frontend (`(frontend)` route group) fetches data directly via the Payload Local API — no HTTP roundtrip. The admin panel lives at `/admin` via the `(payload)` route group.

**Local API vs Repository pattern:** Server Components use `getPayload()` + Local API directly — this is correct and intentional (no HTTP cost). The repository pattern applies only to external HTTP calls (`/next/*` routes, third-party APIs). Do not wrap Local API calls in repositories.

**Key patterns from AGENTS.md (enforced):**

- After any schema change run `generate:types` then `generate:importmap`.
- Always pass `req` to nested Payload operations inside hooks (transaction safety).
- Always set `overrideAccess: false` when passing a `user` to the Local API.
- Use a `context` flag (e.g. `context.skipHooks: true`) to prevent infinite hook loops.
- Field-level `access` functions can only return `boolean` (no query constraints).

Note: `insights` was formerly `posts` — old references to a `posts` collection mean `insights`.

## Local infrastructure

`podman-compose up -d` (o `docker-compose up -d`) levanta Postgres + MinIO usando el `.env` file. En desarrollo normal solo se necesita la DB y MinIO — el app corre con `pnpm dev`.

### Monday.com en local: sandbox propio, con el mock como red de seguridad

**Si tocas Monday o los formularios, pruébalo contra el sandbox.** Existe una cuenta de sandbox propia (Bepartnerlabs) con boards `[LAB] …` que replican los de producción. Su token va en `MONDAY_API_TOKEN` de `.env.local`, y `resolveMondayToken` le da prioridad fuera de producción — importante, porque una base local restaurada de producción trae el token **del cliente** en Settings.

Flujo completo, tres scripts independientes:

```bash
./scripts/dump-prod.sh                        # trae el dump al pod
./scripts/restore-prod-dump.sh                # lo restaura en la base local
node scripts/move-monday-to-sandbox.mjs       # muestra el plan
node scripts/move-monday-to-sandbox.mjs --apply
MONDAY_LIVE=true                              # en .env.local, para enviar de verdad
```

El tercero es obligatorio después de cada restore: el dump trae los board ids, group ids y el mapeo de columnas **del cliente**, así que un envío local con el mock apagado crearía un item real en un board que el equipo comercial lee. El script los reescribe a los `[LAB]`, resolviendo boards y columnas por *nombre* (no por id, para que sobrevivan a que se recreen), y se niega a correr si el token puede ver un board de producción. Es idempotente.

**El mock sigue siendo el valor por defecto.** Sin `MONDAY_LIVE=true`, con `NODE_ENV=development` ninguna llamada sale de la máquina: `src/repositories/mondayMock.ts` intercepta y escribe el payload en consola con el prefijo `[monday:mock]`, devolviendo un id falso. Cubre los dos caminos, que comparten API y token:

- `GenericMondayRepository` — el sync de formularios (`create_item`, `add_file_to_column`).
- `MondayRepository` — los claims de reembolso del `ClaimForm`.

Sirve para ver el cuerpo exacto que se enviaría sin depender de la red. Lo que no comprueba es que Monday lo **acepte** — tipos de columna, adjuntos, autenticación —; para eso está el sandbox. En producción nada de esto aplica: el guard exige `NODE_ENV === 'development'`.

Los items que crees en el sandbox son reales dentro de esa cuenta: bórralos al terminar (`mutation { delete_item(item_id: N) { id } }`).

## Design System (BPL DS)

Antes de escribir cualquier componente visual, invoca la skill `bpl-design-system` (reglas de variables CSS y flujo para agregar un componente). Cuando el usuario pase un path de variable de Figma, invoca la skill `figma-tokens`.

## Repository Pattern

The org-wide rule and its diagram live in the parent `CLAUDE.md`, which loads in
this project too. The concrete paths here: `src/repositories/clients/ApiClient.ts`
(HTTP only) → `src/repositories/<Domain>Repository.ts` (domain methods, error
handling, safe fallbacks) → `src/repositories/index.ts` (the named exports
components import from, e.g. `PagesRepository.translateSlug()`).

## Client Deliverables

`docs/CLIENT-MANUAL.md` is one of the final project deliverables — a self-management usage guide handed off to the client so their content editors can run the site in `/admin` without a developer. It's currently an outline (punteo). As features land that a content editor would need to know about (new block, new admin convention like the `hidden` blockName trick, a new collection), add or update the relevant bullet there — don't let it drift out of sync with what's actually shippable. It gets fleshed out into full step-by-step sections and validated with the client at the end of the project, not written all at once.

## Deploys

`.github/workflows/deploy.yml` only fires on push to `preview/**` and on a published release. Merging to `main` deploys nothing — production ships when you publish the release, and that is also when migrations run against the production DB.

**A branch that adds migrations should end on a `preview/**` branch before it ships.** Push the finished work to e.g. `preview/<feature>` and let the pipeline run `pnpm payload migrate` against the preview database first. A release goes straight to production: the migration runs there with no rehearsal, and `deploy.yml` closes `/admin` and `/api` behind the maintenance firewall rules while it does — only when the release actually adds migrations; one that adds none skips the lock entirely. Finding out there that a migration is slow, locks a table, or fails halfway means finding out with the client locked out of `/admin`.

The rules are scoped: `maintenance-admin` covers `/admin` and `maintenance-api` covers `/api`. **Neither covers `/next/*`**, so form submissions keep working through a release — verified against the live rules on 2026-07-31. The public site stays up unless the release drops or renames a column, and even then only once someone creates the `maintenance-site` rule, which does not exist yet.

**`preview/**` is mandatory, not advisory, when the migration has not been round-tripped locally against a production restore.** The rehearsal has to happen somewhere. Either it happened on your machine —

```bash
./scripts/restore-prod-dump.sh
./scripts/verify-forms-migration.sh --round-trip   # forms migrations
pnpm payload migrate && pnpm payload migrate:down && pnpm payload migrate
```

— against real production data, with the result written into the PR; or it happens on preview, and then the branch **must** end on `preview/<feature>` before the release. What is not an option is neither: a release with a migration nobody has ever run against production-shaped data is the case that takes the site down during the maintenance window.

A local round-trip only substitutes for preview when it ran on an actual production restore. A fresh or seeded local database proves nothing — it has no real content to lose, so it passes regardless.

Releases are published by hand from GitHub, so a deploy in flight can still be stopped from the Actions tab.

## Known gotchas (learned the hard way)

**Don't use `generateStaticParams` on frontend content routes.** It was tried on `/machines/[family]` and `/machines/[family]/[slug]` and caused a production 500 (`DYNAMIC_SERVER_USAGE`) the first time those pages needed to regenerate after a content edit — SSG (`generateStaticParams`) combined with this app's next-intl plugin setup throws on regeneration, even though the initial build succeeds. Reproduced locally via `next build && next start` (not `next dev` — dev mode doesn't hit this). Every other content-driven route (`insights/[slug]`, `projects/[slug]`, `pages/[slug]`) is server-rendered on demand (`ƒ`, no `generateStaticParams`) and works fine — match that pattern instead of trying to statically generate a machines-style route again.

**Writing a `specs: [...]` — including an array field with `localized: true` subfields (e.g. `machines.specs`, `highlights.items`, `capabilities.items`) via a REST `PATCH ...?locale=es` request that doesn't include each existing item's `id` silently wipes that same field's content in every OTHER locale.** The array rows get recreated instead of updated in place, orphaning the sibling locale's data — the request itself returns 200 OK, so nothing looks wrong until you check the other locale. Always fetch the current doc first, and pass the existing `id` back for every array item you're touching, in every locale-scoped write. This bit an entire batch of machines during the `feat/machine-pages-v2` rollout (see `docs/machines-data-population.md`).

## Spec Workflow

Living specs live in `openspec/specs/[feature]/spec.md`. Read the relevant spec before touching a feature.

**When to document:** Only if you'd forget the *why* in 2 weeks — new feature with non-obvious design, architectural change, or something needed across sessions. Bugfixes, style tweaks, and simple config changes go straight to code.

**New feature** → `/superpowers:brainstorming` → save design to `openspec/changes/[id]/design.md`, plan to `tasks.md`, update `openspec/specs/[feature]/spec.md`

**Change to existing feature** → read `openspec/specs/[feature]/spec.md` → `/openspec:proposal [description]` → review → implement

**Simple task** → read spec if it exists → code directly

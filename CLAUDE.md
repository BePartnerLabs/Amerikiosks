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

## Context map

| Where | What is in it |
|---|---|
| [`docs/patterns/`](docs/patterns/README.md) | What this project learned the hard way, one file per topic, each with the incident that motivated it. |
| [`docs/business/`](docs/business/README.md) | Definition of Done, audiences, voice. What "finished" means beyond the code. |
| [`docs/payload/`](docs/payload/README.md) | Vendored Payload reference — how the framework works. Depth on demand, not rules. |
| `src/*/CLAUDE.md` | Directory-local notes. These load automatically when you touch that folder, so they stay short by design. |

## Architecture

Payload and Next.js run in the same process. The frontend (`(frontend)` route group) fetches data directly via the Payload Local API — no HTTP roundtrip. The admin panel lives at `/admin` via the `(payload)` route group.

**Local API vs Repository pattern:** Server Components use `getPayload()` + Local API directly — this is correct and intentional (no HTTP cost). The repository pattern applies only to external HTTP calls (`/next/*` routes, third-party APIs). Do not wrap Local API calls in repositories.

**Payload patterns this project enforces** (deep reference in [`docs/payload/`](docs/payload/README.md)):

- After any schema change run `generate:types` then `generate:importmap`.
- Always pass `req` to nested Payload operations inside hooks (transaction safety).
- Always set `overrideAccess: false` when passing a `user` to the Local API.
- Use a `context` flag (e.g. `context.skipHooks: true`) to prevent infinite hook loops.
- Field-level `access` functions can only return `boolean` (no query constraints).

Note: `insights` was formerly `posts` — old references to a `posts` collection mean `insights`.

## Local infrastructure

`podman-compose up -d` (o `docker-compose up -d`) levanta Postgres + MinIO usando el `.env` file. En desarrollo normal solo se necesita la DB y MinIO — el app corre con `pnpm dev`.

### Monday.com en local

El sandbox propio y el mock que lo respalda están en
[`docs/patterns/monday-local.md`](docs/patterns/monday-local.md). Léelo **antes de
tocar Monday o los formularios**: una base local restaurada de producción trae el
token del cliente, y un envío con el mock apagado crea un item real en un board
que el equipo comercial lee.

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

**Array fields with localized subfields wipe the sibling locale** if you write to them without sending each item's `id`. Read [`docs/patterns/payload-localized-arrays.md`](docs/patterns/payload-localized-arrays.md) before any locale-scoped write.

## Spec Workflow

Living specs live in `openspec/specs/[feature]/spec.md`. Read the relevant spec before touching a feature.

**When to document:** Only if you'd forget the *why* in 2 weeks — new feature with non-obvious design, architectural change, or something needed across sessions. Bugfixes, style tweaks, and simple config changes go straight to code.

**New feature** → `/superpowers:brainstorming` → save design to `openspec/changes/[id]/design.md`, plan to `tasks.md`, update `openspec/specs/[feature]/spec.md`

**Change to existing feature** → read `openspec/specs/[feature]/spec.md` → `/openspec:proposal [description]` → review → implement

**Simple task** → read spec if it exists → code directly

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

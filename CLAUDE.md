# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Middleware

El middleware de Next.js vive en `src/proxy.ts` (no `middleware.ts`) — Next.js lo detecta igual por la configuración en `next.config.ts`.

Incluye protección por password para preview: si `PREVIEW_PASSWORD` está seteado en env, el sitio requiere autenticación. Acceso vía `?preview=<password>` en la URL o desde `/preview-login`.

## Stack

- **Next.js 16** (App Router) + **Payload CMS 3.82.1** — unified instance (frontend and admin in one Next.js app)
- **PostgreSQL** via `@payloadcms/db-postgres`
- **TailwindCSS v4** + **shadcn/ui** (Radix primitives)
- **TypeScript** throughout

## Commands

```bash
pnpm dev                    # Start dev server
pnpm build                  # Production build (also runs next-sitemap postbuild)
pnpm start                  # Serve production build
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint with auto-fix
pnpm generate:types         # Regenerate payload-types.ts after schema changes
pnpm generate:importmap     # Regenerate admin import map after adding components
pnpm test:int               # Vitest integration tests
pnpm test:e2e               # Playwright e2e tests
pnpm payload migrate:create # Create a new DB migration
pnpm payload migrate        # Run pending DB migrations (run before pnpm start in prod)
```

TypeScript check: `tsc --noEmit`

## Project Structure

```
src/
├── app/
│   ├── (frontend)/      # Public-facing Next.js routes
│   └── (payload)/       # Payload admin panel routes
├── collections/         # Payload collection configs (Pages, Posts, Media, Categories, Users)
├── globals/             # Header, Footer globals
├── blocks/              # Layout-builder blocks (Hero, Content, Media, CTA, Archive)
├── fields/              # Reusable field definitions
├── hooks/               # Payload lifecycle hooks
├── access/              # Access control functions
├── components/          # Shared React components (server + client)
├── heros/               # Hero block variants
├── search/              # Payload search plugin config
├── plugins/             # Payload plugin setup
├── providers/           # React context providers
├── endpoints/           # Custom Payload REST endpoints
├── utilities/           # Shared utility functions
└── payload.config.ts    # Root Payload config
```

## Architecture

Payload and Next.js run in the same process. The frontend (`(frontend)` route group) fetches data directly via the Payload Local API — no HTTP roundtrip. The admin panel lives at `/admin` via the `(payload)` route group.

**Key patterns from AGENTS.md (enforced):**

- After any schema change run `generate:types` then `generate:importmap`.
- Always pass `req` to nested Payload operations inside hooks (transaction safety).
- Always set `overrideAccess: false` when passing a `user` to the Local API.
- Use a `context` flag (e.g. `context.skipHooks: true`) to prevent infinite hook loops.
- Field-level `access` functions can only return `boolean` (no query constraints).

## Collections

| Slug | Purpose |
|------|---------|
| `pages` | Layout-builder pages with draft/preview support |
| `posts` | Blog/news with layout builder + draft/preview |
| `media` | Uploads (images, files) with pre-configured sizes |
| `categories` | Nested taxonomy for posts |
| `users` | Auth-enabled, admin panel access |

## Environment

Copy `.env.example` to `.env`. Requires `DATABASE_URL` (Postgres) and `PAYLOAD_SECRET`.

## Docker

`docker-compose up` spins up the full stack using the `.env` file.

## Testing

- Integration: Vitest (`vitest.config.mts`), setup in `vitest.setup.ts`, env from `test.env`
- E2E: Playwright (`playwright.config.ts`)

## Design System (BPL DS)

Antes de escribir cualquier componente visual, consulta el DS:

- **Contrato del componente:** `https://ds.bepartnerlabs.com/components/<name>/` — markup canónico verbatim
- **Referencia completa para agentes:** `https://ds.bepartnerlabs.com/AGENTS.md`
- **Spec del proyecto:** `openspec/specs/design-system/spec.md`

**Regla de variables CSS (3 niveles):**

| Nivel | Prefijo | Dónde | Para qué |
|---|---|---|---|
| 1 | `--bp-*` | `:root` (viene del DS) | Tokens base — no redeclarar |
| 1.5 | `--ak-*` | `:root` en `frontend.css` | Brand tokens del proyecto |
| 2 | `--<component>-*` | En el selector del componente | Override del default DS — **solo si el default no sirve** |
| 3 | `--_*` | Interno del DS | Variables privadas — nunca overridear |

**Flujo correcto para agregar un componente DS:**
1. Copia el markup de `https://ds.bepartnerlabs.com/components/<name>/` verbatim
2. Compara el diseño con los defaults del DS
3. Declara Level 2 overrides solo donde los defaults difieren
4. Nunca uses `--ak-*` directamente en propiedades CSS de componentes DS

## Repository Pattern

All API calls (internal `/next/*` routes and external services) must follow the repository pattern:

```
fetch() / axios
    ↓
src/repositories/clients/ApiClient.ts   ← HTTP concern only
    ↓
src/repositories/<Domain>Repository.ts  ← business methods, error handling, fallbacks
    ↓
src/repositories/index.ts               ← named exports consumed by components
```

- `ApiClient` wraps `fetch`, builds URLs, throws on non-OK responses.
- Repositories expose domain methods (`PagesRepository.translateSlug()`), catch errors, return safe fallbacks.
- Components import from `@/repositories`, never call `fetch` directly.

Reference: `https://www.giorgiosaud.io/notebook/repository-pattern.md`

## Spec Workflow

Living specs live in `openspec/specs/[feature]/spec.md`. Read the relevant spec before touching a feature.

**When to document:** Only if you'd forget the *why* in 2 weeks — new feature with non-obvious design, architectural change, or something needed across sessions. Bugfixes, style tweaks, and simple config changes go straight to code.

**New feature** → `/superpowers:brainstorming` → save design to `openspec/changes/[id]/design.md`, plan to `tasks.md`, update `openspec/specs/[feature]/spec.md`

**Change to existing feature** → read `openspec/specs/[feature]/spec.md` → `/openspec:proposal [description]` → review → implement

**Simple task** → read spec if it exists → code directly

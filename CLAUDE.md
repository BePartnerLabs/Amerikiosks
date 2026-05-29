# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Spec Workflow

Living specs live in `openspec/specs/[feature]/spec.md`. Read the relevant spec before touching a feature.

**When to document:** Only if you'd forget the *why* in 2 weeks — new feature with non-obvious design, architectural change, or something needed across sessions. Bugfixes, style tweaks, and simple config changes go straight to code.

**New feature** → `/superpowers:brainstorming` → save design to `openspec/changes/[id]/design.md`, plan to `tasks.md`, update `openspec/specs/[feature]/spec.md`

**Change to existing feature** → read `openspec/specs/[feature]/spec.md` → `/openspec:proposal [description]` → review → implement

**Simple task** → read spec if it exists → code directly

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Context

Organizational and project conventions for this repository come from **BPL Context
Manager**, not from this file — `bpl.yml` at the root binds the repo to its project.
Call `get_required_context` first in a session, then `list_specs` for the rest.

What lives there, so you know what you are missing if you skip the call:

| Layer | Capability | What it settles |
|---|---|---|
| `org` | `commit-conventions` | Conventional Commits, and the `subject-case` rule the hook enforces |
| `org` | `repository-pattern` | `fetch → ApiClient → Repository → index`, and when it does not apply |
| `project` | `payload-conventions` | Local API vs repositories, `generate:types`, `req` in hooks, `overrideAccess`, localized arrays, `depth`/`select` |
| `project` | `deploys-and-migrations` | What triggers a deploy, and the two valid ways to rehearse a migration |
| `project` | `local-development` | Compose, `src/proxy.ts`, read-only R2, the Monday rewrite after a restore, `generateStaticParams` |

**The one rule duplicated here on purpose**, because forgetting it takes production
down and this file always loads while an MCP call is a choice: a branch that adds a
migration ships only after that migration has been round-tripped against a real
production restore, with the result written into the PR — or after the branch has gone
through `preview/**`. Never neither. Detail in `deploys-and-migrations`.

Releases are published by hand, by a person. Stop at the merge to `main`.

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
| [`docs/post-release-admin.md`](docs/post-release-admin.md) | What has to be done by hand in `/admin` for shipped code to actually appear. Read it when picking the machines work back up. |

## Architecture

Payload and Next.js run in the same process. The frontend (`(frontend)` route group)
fetches data directly via the Payload Local API — no HTTP roundtrip. The admin panel
lives at `/admin` via the `(payload)` route group.

The conventions that follow from that are in `payload-conventions`.

## Design System (BPL DS)

Antes de escribir cualquier componente visual, invoca la skill `bpl-design-system`
(reglas de variables CSS y flujo para agregar un componente). Cuando el usuario pase un
path de variable de Figma, invoca la skill `figma-tokens`.

## Client Deliverables

`docs/CLIENT-MANUAL.md` is one of the final project deliverables — a self-management
usage guide handed off to the client so their content editors can run the site in
`/admin` without a developer. It's currently an outline (punteo). As features land that
a content editor would need to know about (new block, new admin convention like the
`hidden` blockName trick, a new collection), add or update the relevant bullet there —
don't let it drift out of sync with what's actually shippable. It gets fleshed out into
full step-by-step sections and validated with the client at the end of the project, not
written all at once.

## Spec Workflow

Living specs live in `openspec/specs/[feature]/spec.md`. Read the relevant spec before
touching a feature.

**When to document:** Only if you'd forget the *why* in 2 weeks — new feature with
non-obvious design, architectural change, or something needed across sessions. Bugfixes,
style tweaks, and simple config changes go straight to code.

**New feature** → `/superpowers:brainstorming` → save design to
`openspec/changes/[id]/design.md`, plan to `tasks.md`, update
`openspec/specs/[feature]/spec.md`

**Change to existing feature** → read `openspec/specs/[feature]/spec.md` →
`/openspec:proposal [description]` → review → implement

**Simple task** → read spec if it exists → code directly

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

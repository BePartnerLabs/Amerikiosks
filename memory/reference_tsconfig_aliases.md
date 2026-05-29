---
name: reference_tsconfig_aliases
description: TypeScript path aliases configured in tsconfig.json for the amerikiosks project — use these instead of relative paths
metadata:
  type: reference
---

All aliases map to `src/*` via `tsconfig.json`. Use these in every import instead of relative paths.

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` (catch-all) |
| `@/blocks/*` | `src/blocks/*` |
| `@/collections/*` | `src/collections/*` |
| `@/components/*` | `src/components/*` |
| `@/fields/*` | `src/fields/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/utilities/*` | `src/utilities/*` |
| `@/providers/*` | `src/providers/*` |
| `@/heros/*` | `src/heros/*` |
| `@/access/*` | `src/access/*` |
| `@/endpoints/*` | `src/endpoints/*` |
| `@/plugins/*` | `src/plugins/*` |
| `@/search/*` | `src/search/*` |
| `@/i18n/*` | `src/i18n/*` |
| `@/messages/*` | `src/messages/*` |
| `@payload-config` | `src/payload.config.ts` |

Also: avoid dynamic template-literal `import()` paths — Turbopack can't resolve them. Use explicit static imports instead.

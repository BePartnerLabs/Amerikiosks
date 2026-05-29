# i18n / Translation Spec

## Overview

Two-locale site: English (default, no prefix) and Spanish (`/es/...`). Payload handles content translation; next-intl handles routing and UI strings.

## Locales

| Locale | Prefix | Notes |
|--------|--------|-------|
| `en` | none | default, clean URLs |
| `es` | `/es/` | prefixed |

Strategy: `localePrefix: 'as-needed'` — English URLs stay clean.

## Payload Config

```ts
// payload.config.ts
localization: {
  locales: ['en', 'es'],
  defaultLocale: 'en',
  fallback: true,   // untranslated ES fields fall back to EN
}
```

### Localized fields

| Collection / Global | Fields |
|---------------------|--------|
| `Pages` | `title`, `slug`, all layout block text fields, meta title/description |
| `Posts` | `title`, `slug`, all layout block text fields, meta title/description |
| `Categories` | `title` |
| `Header` global | nav link labels, mega menu labels |
| `Footer` global | nav link labels, tagline/description |

Non-localized: dates, media references, booleans, numerics, `publishedAt`.

After changes: `pnpm generate:types` → `pnpm generate:importmap` → `pnpm payload migrate:create` → `pnpm payload migrate`.

## Route Structure

```
src/app/(frontend)/
  [locale]/
    layout.tsx        ← html lang, next-intl provider + messages
    page.tsx
    [slug]/page.tsx
    posts/page.tsx
    posts/[slug]/page.tsx
    posts/page/[pageNumber]/page.tsx
    search/page.tsx
    not-found.tsx
```

Flat routes under `(frontend)` move inside `[locale]/`.

## Middleware

`src/middleware.ts` using `next-intl/middleware`:
- Detects locale from URL prefix → Accept-Language → default (`en`)
- Excludes `/admin` and `/api` routes

## Payload Data Fetches

Every fetch passes the active locale:

```ts
await payload.findOne({
  collection: 'pages',
  where: { slug: { equals: slug } },
  locale,
  fallbackLocale: 'en',
})
```

## UI Strings

Static strings (not from Payload) live in:

```
src/messages/
  en.json
  es.json
```

Strings in scope: nav aria labels, "Menu"/"Close", search placeholder, "No results", pagination labels, "Posts" heading, 404 message.

Server components: `getTranslations()`. Client components: `useTranslations()`.

## Language Switcher

Client component in `Header` nav. Renders `EN` / `ES` links. When switching, fetches target-locale slug via:

```
GET /api/pages/{id}?locale=es&depth=0
```

Falls back to current slug if no translation exists.

## Status

Design approved 2026-05-28. Implementation pending.

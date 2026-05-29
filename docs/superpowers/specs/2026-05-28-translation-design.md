# Translation / Internationalization Design

**Date:** 2026-05-28  
**Stack:** Next.js 16 App Router + Payload CMS 3.82.1 + next-intl  
**Locales:** `en` (default, no prefix), `es` (prefix `/es/...`)

---

## 1. Payload Localization Config

Add a `localization` block to `payload.config.ts`:

```ts
localization: {
  locales: ['en', 'es'],
  defaultLocale: 'en',
  fallback: true,
}
```

`fallback: true` means any untranslated Spanish field falls back to English.

### Fields marked `localized: true`

Apply to translatable fields in every collection and global:

| Collection / Global | Localized fields |
|---------------------|-----------------|
| `Pages` | `title`, `slug`, all layout block text fields, meta title/description |
| `Posts` | `title`, `slug`, all layout block text fields, meta title/description |
| `Categories` | `title` |
| `Header` global | nav link labels, mega menu labels |
| `Footer` global | nav link labels, tagline/description text |

Non-localized (stay shared): dates, media references, booleans, numeric fields, `publishedAt`.

A DB migration is generated and run after config changes: `pnpm payload migrate:create` then `pnpm payload migrate`.

---

## 2. Next.js Routing

### Locale prefix strategy

- `localePrefix: 'as-needed'` via next-intl
- English (default): clean URLs — `/`, `/about`, `/posts/my-post`
- Spanish: prefixed — `/es/`, `/es/sobre-nosotros`, `/es/posts/mi-post`

### Route structure

```
src/app/(frontend)/
  [locale]/
    layout.tsx        ← sets <html lang>, loads next-intl provider + messages
    page.tsx
    [slug]/page.tsx
    posts/
      page.tsx
      [slug]/page.tsx
      page/[pageNumber]/page.tsx
    search/page.tsx
    not-found.tsx
```

The existing flat routes under `(frontend)` are moved inside `[locale]/`.

### Middleware

`src/middleware.ts` using `next-intl/middleware`:

- Detects locale from URL prefix, then `Accept-Language` header, then default (`en`)
- Non-prefixed URLs for English pass through unchanged
- Non-prefixed URLs for Spanish redirect to `/es/...`
- Payload admin routes (`/admin`, `/api`) are excluded from middleware

### Payload API calls

Every page/data fetch passes the active locale:

```ts
const page = await payload.findOne({
  collection: 'pages',
  where: { slug: { equals: slug } },
  locale,          // 'en' or 'es'
  fallbackLocale: 'en',
})
```

---

## 3. Localized Slugs

`slug` field on `Pages` and `Posts` has `localized: true`.

- English slug: `about`  → URL: `/about`
- Spanish slug: `sobre-nosotros` → URL: `/es/sobre-nosotros`
- If no Spanish slug is set, `fallback: true` uses the English slug → `/es/about`

Slug lookup in `[locale]/[slug]/page.tsx` queries by slug within the current locale.

---

## 4. UI Strings (next-intl messages)

Static hardcoded strings in components are extracted to:

```
src/messages/
  en.json
  es.json
```

Scope — only strings not sourced from Payload:

- Header/nav UI (e.g., "Menu", "Close", aria labels)
- Footer UI
- Search placeholder, "No results" message
- Pagination labels ("Previous", "Next", "Page X of Y")
- Posts listing heading ("Posts")
- 404 page message

Server components use `getTranslations()`, client components use `useTranslations()`.

---

## 5. Language Switcher

A client component added to the `Header` nav.

- Renders `EN` / `ES` toggle links
- Default locale (EN): links to the path without prefix
- Spanish (ES): links to `/es/` + equivalent slug

### Localized slug resolution

When switching locale, the switcher needs the slug in the target locale. It receives the current page's Payload document ID (passed down from the page) and fetches the target-locale slug on the client:

```ts
// GET /api/pages/{id}?locale=es&depth=0 → read slug field
```

If no translated slug exists, falls back to the current slug.

The switcher is styled inline with the existing header nav design (no separate dropdown needed for two locales).

---

## Implementation Order

1. Install `next-intl`
2. Add Payload `localization` config + mark fields
3. Generate types + run migration
4. Add next-intl middleware
5. Restructure `(frontend)` routes under `[locale]/`
6. Update all Payload data fetches to pass `locale`
7. Create `src/messages/en.json` + `es.json`, wire up provider
8. Build language switcher component
9. Update sitemap config for locales

---
name: project_i18n_translatable_elements
description: All elements in Amerikiosks that must be provided in both EN and ES — applies to seeds, admin content, and any new fields added
metadata:
  type: project
---

Every piece of content must exist in both `en` and `es`. Slugs are NOT translated — they stay in English. Only content fields translate.

**Payload collections/globals — localized fields:**

| Collection / Global | Localized fields |
|---|---|
| `Pages` | `title`, `slug` (keep same value), all block text fields, meta title/description |
| `Posts` | `title`, `slug` (keep same), all block text fields, meta title/description |
| `Categories` | `title` |
| `Header` | nav link `label`, nav link `url` (keep same), mega menu `panelLabel`, `panelHeadline`, `panelDescription`, `rightTitle`, `rightSubtitle`, item `title`, item `description`, `cta.label` |
| `Footer` | nav link labels, tagline/description |

**Routing rule:** Slugs stay English. Locale prefix (`/es/`) handles language switching. `/solutions` in EN → `/es/solutions` in ES.

**Seed rule:** Always pass locale via `req`: `req: { ...req, locale: 'en' }` and `req: { ...req, locale: 'es' }`. Do NOT rely on `locale:` top-level param alone — localized subfields inside arrays require locale on `req`.

**UI strings:** Static strings live in `src/messages/en.json` and `src/messages/es.json`. Use `getTranslations()` in server components and `useTranslations()` in client components.

# Translation / i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable English (default, no URL prefix) + Spanish (`/es/...`) on the Amerikiosks site using Payload CMS native localization + next-intl routing.

**Architecture:** Payload stores `en`/`es` field values per document with `fallback: true` (Spanish falls back to English if untranslated). next-intl handles `[locale]` routing with `localePrefix: 'as-needed'` so English URLs stay clean. A `LocaleSwitcher` client component in the Header swaps the locale prefix in the current URL.

**Tech Stack:** next-intl ^3, Payload 3.82.1 localization, Next.js 16 App Router `[locale]` segment, PostgreSQL (migration required)

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/payload.config.ts` — add `localization` block |
| Modify | `src/collections/Pages/index.ts` — `title`, `slug` localized |
| Modify | `src/collections/Posts/index.ts` — `title`, `slug`, `content` localized |
| Modify | `src/collections/Categories.ts` — `title`, `slug` localized |
| Modify | `src/fields/link.ts` — `label`, `url` fields localized |
| Modify | `src/heros/config.ts` — `richText` localized |
| Modify | `src/blocks/CallToAction/config.ts` — `richText` localized |
| Modify | `src/blocks/Content/config.ts` — `richText` localized |
| Modify | `src/blocks/Banner/config.ts` — `content` localized |
| Modify | `src/Header/config.ts` — mega menu text fields localized |
| Modify | `src/utilities/getGlobals.ts` — accept `locale` param |
| Create | `src/i18n/routing.ts` — next-intl routing config |
| Create | `src/i18n/request.ts` — next-intl server request config |
| Create | `src/middleware.ts` — next-intl locale middleware |
| Modify | `next.config.ts` — add next-intl plugin |
| Move+Modify | `src/app/(frontend)/[locale]/layout.tsx` — locale layout with NextIntlClientProvider |
| Move+Modify | `src/app/(frontend)/[locale]/page.tsx` |
| Move+Modify | `src/app/(frontend)/[locale]/[slug]/page.tsx` — pass `locale` to Payload |
| Move+Modify | `src/app/(frontend)/[locale]/posts/page.tsx` |
| Move+Modify | `src/app/(frontend)/[locale]/posts/[slug]/page.tsx` |
| Move+Modify | `src/app/(frontend)/[locale]/posts/page/[pageNumber]/page.tsx` |
| Move+Modify | `src/app/(frontend)/[locale]/search/page.tsx` |
| Move+Modify | `src/app/(frontend)/[locale]/not-found.tsx` |
| Create | `src/messages/en.json` |
| Create | `src/messages/es.json` |
| Create | `src/components/LocaleSwitcher/index.tsx` |
| Modify | `src/Header/Component.client.tsx` — add LocaleSwitcher |
| Modify | `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts` — add locales |
| Modify | `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts` — add locales |

---

## Task 1: Install next-intl

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install the package**

```bash
pnpm add next-intl
```

Expected output: next-intl added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify install**

```bash
pnpm list next-intl
```

Expected: shows `next-intl x.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install next-intl"
```

---

## Task 2: Add Payload localization config

**Files:**
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Add localization block**

In `src/payload.config.ts`, add `localization` inside `buildConfig({...})` after `globals`:

```ts
// src/payload.config.ts
export default buildConfig({
  // ... existing config ...
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  // ... rest of config ...
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/payload.config.ts
git commit -m "feat(i18n): add Payload localization config (en + es)"
```

---

## Task 3: Localize fields in Pages and Posts collections

**Files:**
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/collections/Posts/index.ts`

- [ ] **Step 1: Update Pages collection**

In `src/collections/Pages/index.ts`, add `localized: true` to `title`, and change `slugField()` to pass `localized: true`:

```ts
// src/collections/Pages/index.ts
fields: [
  {
    name: 'title',
    type: 'text',
    required: true,
    localized: true,          // ADD THIS
  },
  {
    type: 'tabs',
    tabs: [
      {
        fields: [hero],
        label: 'Hero',
      },
      {
        fields: [
          {
            name: 'layout',
            type: 'blocks',
            blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
            required: true,
            admin: {
              initCollapsed: true,
            },
          },
        ],
        label: 'Content',
      },
      {
        name: 'meta',
        label: 'SEO',
        fields: [
          OverviewField({
            titlePath: 'meta.title',
            descriptionPath: 'meta.description',
            imagePath: 'meta.image',
          }),
          MetaTitleField({ hasGenerateFn: true }),
          MetaImageField({ relationTo: 'media' }),
          MetaDescriptionField({}),
          PreviewField({
            hasGenerateFn: true,
            titlePath: 'meta.title',
            descriptionPath: 'meta.description',
          }),
        ],
      },
    ],
  },
  {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
    },
  },
  slugField('title', { localized: true }),   // CHANGE: pass { localized: true }
],
```

- [ ] **Step 2: Update Posts collection**

In `src/collections/Posts/index.ts`, add `localized: true` to `title` and the `content` richText field, and update `slugField`:

```ts
// src/collections/Posts/index.ts
fields: [
  {
    name: 'title',
    type: 'text',
    required: true,
    localized: true,          // ADD THIS
  },
  {
    type: 'tabs',
    tabs: [
      {
        fields: [
          {
            name: 'heroImage',
            type: 'upload',
            relationTo: 'media',
          },
          {
            name: 'content',
            type: 'richText',
            localized: true,  // ADD THIS
            editor: lexicalEditor({
              features: ({ rootFeatures }) => {
                return [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ]
              },
            }),
            label: false,
            required: true,
          },
        ],
        label: 'Content',
      },
      // ... Meta and SEO tabs unchanged ...
    ],
  },
  // ... publishedAt, authors, populatedAuthors unchanged ...
  slugField('title', { localized: true }),   // CHANGE: pass { localized: true }
],
```

- [ ] **Step 3: Verify TypeScript**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Pages/index.ts src/collections/Posts/index.ts
git commit -m "feat(i18n): localize title, slug, content fields in Pages and Posts"
```

---

## Task 4: Localize fields in Categories, link field, hero, and Header global

**Files:**
- Modify: `src/collections/Categories.ts`
- Modify: `src/fields/link.ts`
- Modify: `src/heros/config.ts`
- Modify: `src/Header/config.ts`

- [ ] **Step 1: Update Categories**

In `src/collections/Categories.ts`:

```ts
// src/collections/Categories.ts
fields: [
  {
    name: 'title',
    type: 'text',
    required: true,
    localized: true,          // ADD THIS
  },
  slugField('title', {
    position: undefined,
    localized: true,          // ADD THIS
  }),
],
```

- [ ] **Step 2: Update link field**

In `src/fields/link.ts`, find where `label` is added to `linkResult.fields` and add `localized: true` to the label field. Also add `localized: true` to the `url` field:

```ts
// src/fields/link.ts  — inside the linkTypes array definition
const linkTypes: Field[] = [
  {
    name: 'reference',
    type: 'relationship',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'reference',
    },
    label: 'Document to link to',
    relationTo: ['pages', 'posts'],
    required: true,
  },
  {
    name: 'url',
    type: 'text',
    localized: true,          // ADD THIS — custom URLs may differ per locale
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'custom',
    },
    label: 'Custom URL',
    required: true,
  },
]

// And in the !disableLabel branch, update the label field:
linkResult.fields.push({
  type: 'row',
  fields: [
    ...linkTypes,
    {
      name: 'label',
      type: 'text',
      localized: true,        // ADD THIS
      admin: {
        width: '50%',
      },
      label: 'Label',
      required: true,
    },
  ],
})
```

- [ ] **Step 3: Update hero config**

In `src/heros/config.ts`, add `localized: true` to the `richText` field:

```ts
// src/heros/config.ts — inside the hero field's fields array
{
  name: 'richText',
  type: 'richText',
  localized: true,            // ADD THIS
  editor: lexicalEditor({
    features: ({ rootFeatures }) => {
      return [
        ...rootFeatures,
        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ]
    },
  }),
  label: false,
},
```

- [ ] **Step 4: Update Header global mega menu text fields**

In `src/Header/config.ts`, add `localized: true` to `panelLabel`, `panelHeadline`, `panelDescription`, `rightTitle`, `rightSubtitle`, and the item `title` and `description` fields inside the `megaMenu` group:

```ts
// src/Header/config.ts — inside the megaMenu group fields
fields: [
  {
    name: 'panelLabel',
    type: 'text',
    localized: true,          // ADD
    label: 'Left panel label (e.g. SOLUTIONS)',
    required: true,
  },
  {
    name: 'panelHeadline',
    type: 'text',
    localized: true,          // ADD
    label: 'Left panel headline',
    required: true,
  },
  {
    name: 'panelDescription',
    type: 'textarea',
    localized: true,          // ADD
    label: 'Left panel description',
  },
  {
    name: 'rightTitle',
    type: 'text',
    localized: true,          // ADD
    label: 'Right panel title',
    required: true,
  },
  {
    name: 'rightSubtitle',
    type: 'textarea',
    localized: true,          // ADD
    label: 'Right panel subtitle',
  },
  {
    name: 'items',
    type: 'array',
    maxRows: 4,
    label: 'Menu items (max 4)',
    fields: [
      {
        name: 'icon',
        type: 'upload',
        relationTo: 'media',
        label: 'Icon',
      },
      {
        name: 'title',
        type: 'text',
        localized: true,      // ADD
        label: 'Item title',
        required: true,
      },
      {
        name: 'description',
        type: 'textarea',
        localized: true,      // ADD
        label: 'Item description',
      },
      link({
        appearances: false,
        disableLabel: true,
        overrides: { label: 'Item link' },
      }),
    ],
  },
],
```

- [ ] **Step 5: Verify TypeScript**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/collections/Categories.ts src/fields/link.ts src/heros/config.ts src/Header/config.ts
git commit -m "feat(i18n): localize fields in Categories, link, hero, Header"
```

---

## Task 5: Localize fields in blocks

**Files:**
- Modify: `src/blocks/CallToAction/config.ts`
- Modify: `src/blocks/Content/config.ts`
- Modify: `src/blocks/Banner/config.ts`

- [ ] **Step 1: CallToAction block**

In `src/blocks/CallToAction/config.ts`:

```ts
// src/blocks/CallToAction/config.ts
fields: [
  {
    name: 'richText',
    type: 'richText',
    localized: true,          // ADD
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  linkGroup({
    appearances: ['default', 'outline'],
    overrides: { maxRows: 2 },
  }),
],
```

- [ ] **Step 2: Content block**

In `src/blocks/Content/config.ts`, add `localized: true` to the `richText` field inside `columnFields`:

```ts
// src/blocks/Content/config.ts — inside columnFields array
{
  name: 'richText',
  type: 'richText',
  localized: true,            // ADD
  editor: lexicalEditor({
    features: ({ rootFeatures }) => {
      return [
        ...rootFeatures,
        HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ]
    },
  }),
  label: false,
},
```

- [ ] **Step 3: Banner block**

In `src/blocks/Banner/config.ts`:

```ts
// src/blocks/Banner/config.ts
{
  name: 'content',
  type: 'richText',
  localized: true,            // ADD
  editor: lexicalEditor({
    features: ({ rootFeatures }) => {
      return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
    },
  }),
  label: false,
  required: true,
},
```

- [ ] **Step 4: Verify TypeScript**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/CallToAction/config.ts src/blocks/Content/config.ts src/blocks/Banner/config.ts
git commit -m "feat(i18n): localize richText fields in blocks"
```

---

## Task 6: Generate types and run DB migration

**Files:**
- Regenerate: `src/payload-types.ts`
- Create: `src/migrations/YYYYMMDD_HHMMSS_add_localization.ts` (auto-generated)
- Modify: `src/migrations/index.ts` (auto-updated)

- [ ] **Step 1: Regenerate Payload types**

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` updated — localized fields now have locale-keyed types.

- [ ] **Step 2: Regenerate import map**

```bash
pnpm generate:importmap
```

Expected: `src/app/(payload)/admin/importMap.js` updated.

- [ ] **Step 3: Create the migration**

```bash
pnpm payload migrate:create --name add_localization
```

Expected: a new file created in `src/migrations/` with `add_localization` in the name.

- [ ] **Step 4: Run the migration**

Make sure your local Postgres is running (via Docker if needed):

```bash
docker-compose up -d db   # or however you start Postgres locally
pnpm payload migrate
```

Expected: migration runs successfully, locale columns added to DB tables.

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```

Expected: server starts at http://localhost:3000 without errors. Visit `/admin` and confirm you can switch locales in any Pages document.

- [ ] **Step 6: Commit**

```bash
git add src/payload-types.ts src/migrations/ src/app/\(payload\)/admin/importMap.js
git commit -m "feat(i18n): regenerate types and create localization DB migration"
```

---

## Task 7: Add next-intl routing config and middleware

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create routing config**

Create `src/i18n/routing.ts`:

```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})
```

- [ ] **Step 2: Create server request config**

Create `src/i18n/request.ts`:

```ts
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'en' | 'es')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create middleware**

Create `src/middleware.ts`:

```ts
// src/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all paths except Payload admin, API routes, Next internals, and static files
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon|.*\\..*).*)'],
}
```

- [ ] **Step 4: Update next.config.ts**

In `next.config.ts`, import and apply the next-intl plugin:

```ts
// next.config.ts
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
```

- [ ] **Step 5: Verify TypeScript**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/middleware.ts next.config.ts
git commit -m "feat(i18n): add next-intl routing config and middleware"
```

---

## Task 8: Create message files

**Files:**
- Create: `src/messages/en.json`
- Create: `src/messages/es.json`

- [ ] **Step 1: Create English messages**

Create `src/messages/en.json`:

```json
{
  "nav": {
    "menu": "Menu",
    "close": "Close menu"
  },
  "footer": {
    "rights": "All rights reserved"
  },
  "search": {
    "placeholder": "Search...",
    "noResults": "No results found for",
    "heading": "Search Results"
  },
  "posts": {
    "heading": "Posts",
    "readMore": "Read more"
  },
  "pagination": {
    "previous": "Previous",
    "next": "Next",
    "page": "Page {current} of {total}"
  },
  "notFound": {
    "heading": "404 - Page Not Found",
    "message": "The page you are looking for does not exist.",
    "backHome": "Back to Home"
  }
}
```

- [ ] **Step 2: Create Spanish messages**

Create `src/messages/es.json`:

```json
{
  "nav": {
    "menu": "Menú",
    "close": "Cerrar menú"
  },
  "footer": {
    "rights": "Todos los derechos reservados"
  },
  "search": {
    "placeholder": "Buscar...",
    "noResults": "No se encontraron resultados para",
    "heading": "Resultados de búsqueda"
  },
  "posts": {
    "heading": "Publicaciones",
    "readMore": "Leer más"
  },
  "pagination": {
    "previous": "Anterior",
    "next": "Siguiente",
    "page": "Página {current} de {total}"
  },
  "notFound": {
    "heading": "404 - Página no encontrada",
    "message": "La página que buscas no existe.",
    "backHome": "Volver al inicio"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/messages/
git commit -m "feat(i18n): add en and es message files"
```

---

## Task 9: Restructure frontend routes under [locale]

**Files:**
- Create: `src/app/(frontend)/[locale]/layout.tsx` (replaces old layout.tsx)
- Create: `src/app/(frontend)/[locale]/page.tsx`
- Create: `src/app/(frontend)/[locale]/[slug]/page.tsx`
- Create: `src/app/(frontend)/[locale]/[slug]/page.client.tsx`
- Create: `src/app/(frontend)/[locale]/posts/page.tsx`
- Create: `src/app/(frontend)/[locale]/posts/[slug]/page.tsx`
- Create: `src/app/(frontend)/[locale]/posts/[slug]/page.client.tsx`
- Create: `src/app/(frontend)/[locale]/posts/page/[pageNumber]/page.tsx`
- Create: `src/app/(frontend)/[locale]/posts/page/[pageNumber]/page.client.tsx`
- Create: `src/app/(frontend)/[locale]/search/page.tsx`
- Create: `src/app/(frontend)/[locale]/search/page.client.tsx`
- Create: `src/app/(frontend)/[locale]/not-found.tsx`
- Delete: `src/app/(frontend)/layout.tsx`
- Delete: `src/app/(frontend)/page.tsx`
- Delete: `src/app/(frontend)/[slug]/` (directory)
- Delete: `src/app/(frontend)/posts/` (directory, non-sitemaps)
- Delete: `src/app/(frontend)/search/` (directory)
- Delete: `src/app/(frontend)/not-found.tsx`

- [ ] **Step 1: Create the locale layout**

Create `src/app/(frontend)/[locale]/layout.tsx`:

```tsx
// src/app/(frontend)/[locale]/layout.tsx
import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Poppins } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { routing } from '@/i18n/routing'

import '../globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const locales = routing.locales

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const { isEnabled } = await draftMode()

  if (!locales.includes(locale as 'en' | 'es')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, poppins.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AdminBar adminBarProps={{ preview: isEnabled }} />
            <Header />
            {children}
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
```

- [ ] **Step 2: Create locale home page**

Create `src/app/(frontend)/[locale]/page.tsx`:

```tsx
// src/app/(frontend)/[locale]/page.tsx
import PageTemplate, { generateMetadata } from './[slug]/page'

export default PageTemplate
export { generateMetadata }
```

- [ ] **Step 3: Create [locale]/[slug]/page.tsx**

Create `src/app/(frontend)/[locale]/[slug]/page.tsx`:

```tsx
// src/app/(frontend)/[locale]/[slug]/page.tsx
import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const params: { locale: string; slug: string }[] = []

  for (const locale of routing.locales) {
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      locale,
      select: { slug: true },
    })

    for (const doc of pages.docs) {
      if (doc.slug && doc.slug !== 'home') {
        params.push({ locale, slug: doc.slug as string })
      }
    }
  }

  return params
}

type Args = {
  params: Promise<{ slug?: string; locale: string }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home', locale } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({ slug: decodedSlug, locale })

  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({ slug: decodedSlug, locale })
  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})
```

- [ ] **Step 4: Copy page.client.tsx to new location**

Copy `src/app/(frontend)/[slug]/page.client.tsx` to `src/app/(frontend)/[locale]/[slug]/page.client.tsx` unchanged.

```bash
cp src/app/\(frontend\)/\[slug\]/page.client.tsx src/app/\(frontend\)/\[locale\]/\[slug\]/page.client.tsx
```

- [ ] **Step 5: Create [locale]/posts/[slug]/page.tsx**

Read the existing file first:

```bash
cat src/app/\(frontend\)/posts/\[slug\]/page.tsx
```

Create `src/app/(frontend)/[locale]/posts/[slug]/page.tsx` with `locale` added to all Payload calls:

```tsx
// src/app/(frontend)/[locale]/posts/[slug]/page.tsx
import type { Metadata } from 'next'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const params: { locale: string; slug: string }[] = []

  for (const locale of routing.locales) {
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      locale,
      select: { slug: true },
    })

    for (const doc of posts.docs) {
      if (doc.slug) {
        params.push({ locale, slug: doc.slug as string })
      }
    }
  }

  return params
}

type Args = {
  params: Promise<{ slug?: string; locale: string }>
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', locale } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  if (!post) return <PayloadRedirects url={url} />

  const { hero, content, relatedPosts } = post as Post & { hero?: any }

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <PostHero post={post} />
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })
  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})
```

- [ ] **Step 6: Copy posts page.client.tsx files**

```bash
cp src/app/\(frontend\)/posts/\[slug\]/page.client.tsx src/app/\(frontend\)/\[locale\]/posts/\[slug\]/page.client.tsx
```

- [ ] **Step 7: Create [locale]/posts/page.tsx**

Read the existing file:
```bash
cat src/app/\(frontend\)/posts/page.tsx
```

Create `src/app/(frontend)/[locale]/posts/page.tsx` adding `locale` to the Payload call:

```tsx
// src/app/(frontend)/[locale]/posts/page.tsx
import type { Metadata } from 'next/types'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>
      <div className="container mb-8">
        <PageClient />
        <CollectionArchive posts={posts.docs} />
      </div>
      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  return {
    title: 'Posts',
  }
}
```

- [ ] **Step 8: Copy posts page.client.tsx and paginated pages**

```bash
cp src/app/\(frontend\)/posts/page.client.tsx src/app/\(frontend\)/\[locale\]/posts/page.client.tsx
```

Read `src/app/(frontend)/posts/page/[pageNumber]/page.tsx`, then create `src/app/(frontend)/[locale]/posts/page/[pageNumber]/page.tsx` adding `locale` to the Payload call (same pattern as posts/page.tsx above).

```bash
cat src/app/\(frontend\)/posts/page/\[pageNumber\]/page.tsx
```

Then create the file with the same locale pattern — add `locale` to `params`, pass `locale as 'en' | 'es'` and `fallbackLocale: 'en'` to `payload.find`.

```bash
cp src/app/\(frontend\)/posts/page/\[pageNumber\]/page.client.tsx src/app/\(frontend\)/\[locale\]/posts/page/\[pageNumber\]/page.client.tsx
```

- [ ] **Step 9: Create [locale]/search/page.tsx**

```bash
cp src/app/\(frontend\)/search/page.client.tsx src/app/\(frontend\)/\[locale\]/search/page.client.tsx
```

Create `src/app/(frontend)/[locale]/search/page.tsx` — same as current search/page.tsx but add `locale` to params and pass it to the Payload call:

```tsx
// src/app/(frontend)/[locale]/search/page.tsx
import type { Metadata } from 'next/types'
import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{ q: string }>
  params: Promise<{ locale: string }>
}

export default async function Page({ searchParams: searchParamsPromise, params: paramsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const { locale } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale: locale as 'en' | 'es',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { 'meta.description': { like: query } },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Search</h1>
        </div>
      </div>
      <div className="container mb-8">
        <PageClient />
        <Search />
        {posts.docs && posts.docs.length > 0 ? (
          <CollectionArchive posts={posts.docs as CardPostData[]} />
        ) : (
          <div className="container">No results found.</div>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Search',
}
```

- [ ] **Step 10: Create [locale]/not-found.tsx**

Read the current not-found file, then create `src/app/(frontend)/[locale]/not-found.tsx`:

```bash
cat src/app/\(frontend\)/not-found.tsx
```

Create `src/app/(frontend)/[locale]/not-found.tsx` — copy the existing content verbatim (it has no locale dependency).

- [ ] **Step 11: Remove old route files**

```bash
rm -rf src/app/\(frontend\)/\[slug\]
rm src/app/\(frontend\)/page.tsx
rm src/app/\(frontend\)/layout.tsx
rm src/app/\(frontend\)/not-found.tsx
rm -rf src/app/\(frontend\)/posts
rm -rf src/app/\(frontend\)/search
```

> Note: Do NOT delete `src/app/(frontend)/(sitemaps)/` — those are handled in Task 11.

- [ ] **Step 12: Verify TypeScript**

```bash
tsc --noEmit
```

Expected: no errors. Fix any import path issues (e.g. relative paths that changed due to nesting).

- [ ] **Step 13: Test the routes**

```bash
pnpm dev
```

Visit:
- `http://localhost:3000/` — English home page loads
- `http://localhost:3000/es/` — Spanish home page loads (same content until translated)
- `http://localhost:3000/about` (if seeded) — English page loads
- `http://localhost:3000/es/about` — Spanish page loads with fallback

- [ ] **Step 14: Commit**

```bash
git add src/app/\(frontend\)/
git commit -m "feat(i18n): restructure frontend routes under [locale] segment"
```

---

## Task 10: Update getCachedGlobal to support locale

**Files:**
- Modify: `src/utilities/getGlobals.ts`
- Modify: `src/Header/Component.tsx`
- Modify: `src/Footer/Component.tsx`

- [ ] **Step 1: Update getGlobals utility**

In `src/utilities/getGlobals.ts`:

```ts
// src/utilities/getGlobals.ts
import type { Config } from 'src/payload-types'
import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(
  slug: T,
  depth = 0,
  locale = 'en',
): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
  })

  return global
}

export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale = 'en') =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, locale], {
    tags: [`global_${slug}`],
  })
```

- [ ] **Step 2: Update Header Component to pass locale**

In `src/Header/Component.tsx`, read the locale from next-intl and pass it:

```tsx
// src/Header/Component.tsx
import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import React from 'react'

export async function Header() {
  const locale = await getLocale()
  const headerData = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}
```

- [ ] **Step 3: Update Footer Component to pass locale**

In `src/Footer/Component.tsx`, read the locale and pass it:

```tsx
// src/Footer/Component.tsx
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import React from 'react'
// ... other imports from existing file

export async function Footer() {
  const locale = await getLocale()
  const footerData = await getCachedGlobal('footer', 1, locale)()

  // ... rest of existing Footer render logic unchanged
}
```

> Read `src/Footer/Component.tsx` first with `cat` to preserve the existing render logic — only change the `getCachedGlobal` call.

- [ ] **Step 4: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/utilities/getGlobals.ts src/Header/Component.tsx src/Footer/Component.tsx
git commit -m "feat(i18n): pass locale to getCachedGlobal for Header and Footer"
```

---

## Task 11: Build the LocaleSwitcher component

**Files:**
- Create: `src/components/LocaleSwitcher/index.tsx`
- Modify: `src/Header/Component.client.tsx`

- [ ] **Step 1: Create LocaleSwitcher**

Create `src/components/LocaleSwitcher/index.tsx`:

```tsx
// src/components/LocaleSwitcher/index.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export function LocaleSwitcher() {
  const currentLocale = useLocale()
  const pathname = usePathname()

  const getLocalePath = (targetLocale: string): string => {
    if (currentLocale === 'en') {
      // English paths have no prefix: /about → /es/about
      return targetLocale === 'es' ? `/es${pathname === '/' ? '' : pathname}` : pathname
    } else {
      // Spanish paths have /es prefix: /es/about → /about
      const withoutLocale = pathname.replace(/^\/es/, '') || '/'
      return targetLocale === 'en' ? withoutLocale : pathname
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <Link
        href={getLocalePath('en')}
        aria-label="Switch to English"
        className={
          currentLocale === 'en'
            ? 'text-white font-semibold'
            : 'text-white/60 hover:text-white transition-colors'
        }
      >
        EN
      </Link>
      <span className="text-white/40" aria-hidden="true">|</span>
      <Link
        href={getLocalePath('es')}
        aria-label="Cambiar a español"
        className={
          currentLocale === 'es'
            ? 'text-white font-semibold'
            : 'text-white/60 hover:text-white transition-colors'
        }
      >
        ES
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Add LocaleSwitcher to Header**

Read `src/Header/Component.client.tsx`, then add `LocaleSwitcher` to the header JSX. Find the return statement and add the switcher alongside the nav:

```tsx
// src/Header/Component.client.tsx
// Add this import at the top:
import { LocaleSwitcher } from '@/components/LocaleSwitcher'

// In the HeaderClient return, add <LocaleSwitcher /> next to <HeaderNav>:
// (Find the existing JSX that renders HeaderNav and ThemeSelector, and add LocaleSwitcher)
// Example — the exact placement depends on the existing JSX structure:
<div className="flex items-center gap-4">
  <HeaderNav data={data} />
  <LocaleSwitcher />
  {/* existing ThemeSelector or other items */}
</div>
```

> Read the full `src/Header/Component.client.tsx` first to find the right place to insert `<LocaleSwitcher />`.

- [ ] **Step 3: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 4: Test in browser**

```bash
pnpm dev
```

- Visit `http://localhost:3000/` — confirm EN|ES switcher appears in header
- Click ES — confirm redirects to `/es/`
- Click EN — confirm redirects back to `/`

- [ ] **Step 5: Commit**

```bash
git add src/components/LocaleSwitcher/ src/Header/Component.client.tsx
git commit -m "feat(i18n): add LocaleSwitcher component to header"
```

---

## Task 12: Update sitemaps for locales

**Files:**
- Modify: `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`
- Modify: `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`

- [ ] **Step 1: Read existing sitemap files**

```bash
cat src/app/\(frontend\)/\(sitemaps\)/pages-sitemap.xml/route.ts
cat src/app/\(frontend\)/\(sitemaps\)/posts-sitemap.xml/route.ts
```

- [ ] **Step 2: Update pages sitemap**

Update `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts` to emit one URL entry per locale per page:

```ts
// src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { routing } from '@/i18n/routing'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const SITE_URL = getServerSideURL()

  const urls: string[] = []

  for (const locale of routing.locales) {
    const pages = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      locale,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    })

    for (const page of pages.docs) {
      const slug = page.slug === 'home' ? '' : page.slug
      const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`
      urls.push(
        `<url><loc>${SITE_URL}${localePrefix}/${slug}</loc><lastmod>${page.updatedAt}</lastmod></url>`,
      )
    }
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  )
}
```

- [ ] **Step 3: Update posts sitemap**

Apply the same locale loop pattern to `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`:

```ts
// src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { routing } from '@/i18n/routing'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const SITE_URL = getServerSideURL()

  const urls: string[] = []

  for (const locale of routing.locales) {
    const posts = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      locale,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    })

    for (const post of posts.docs) {
      const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`
      urls.push(
        `<url><loc>${SITE_URL}${localePrefix}/posts/${post.slug}</loc><lastmod>${post.updatedAt}</lastmod></url>`,
      )
    }
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 5: Final smoke test**

```bash
pnpm dev
```

- `http://localhost:3000/` — English home loads
- `http://localhost:3000/es/` — Spanish home loads
- Language switcher toggles correctly
- `/admin` — admin panel loads, locale switcher visible per document
- `http://localhost:3000/pages-sitemap.xml` — shows both `en` and `es` URLs

- [ ] **Step 6: Commit**

```bash
git add src/app/\(frontend\)/\(sitemaps\)/
git commit -m "feat(i18n): emit locale-prefixed URLs in page and post sitemaps"
```

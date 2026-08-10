# Frontend routes — index

What each hard-coded route reads, so you don't have to open all of them to find
out which one a collection feeds. **Update the row when you change a route's
queries**; a stale index is worse than none.

"Hard-coded" means a route that exists as a file, as opposed to `/[slug]`, which
is whatever the `pages` collection holds.

## Routes

| Route | File | Reads | Notes |
|---|---|---|---|
| `/` | `[locale]/page.tsx` | re-exports `[slug]/page.tsx` | The home page is a `pages` document, not its own template |
| `/[slug]` | `[locale]/[slug]/page.tsx` | `pages` | Every CMS page, incl. the legal ones. Slugs are localized |
| `/machines` | — | — | **Ya no es una ruta.** Es un documento de `pages` con slug `machines` en EN y `maquinas` en ES, compuesto con los bloques `machineLineup`, `machineFamily` y `machineModels`. Por eso **no** está en el mapa `pathnames`: si estuviera, next-intl reescribiría `/maquinas` → `/machines` antes de que el catch-all `/[slug]` lo viera y el documento en español no resolvería nunca |
| `/machines/[family]` | `[locale]/machines/[family]/page.tsx` | `machine-families`, `machines`, `machine-installations` | Localized path |
| `/machines/[family]/[slug]` | `[locale]/machines/[family]/[slug]/page.tsx` | `machines` | Localized path |
| `/insights` | `[locale]/insights/page.tsx` | `insights` | Listing, page 1 |
| `/insights/page/[pageNumber]` | `[locale]/insights/page/[pageNumber]/page.tsx` | `insights` | Pagination targets |
| `/insights/[slug]` | `[locale]/insights/[slug]/page.tsx` | `insights` | |
| `/projects/[slug]` | `[locale]/projects/[slug]/page.tsx` | `projects` | Detail only — there is **no** `/projects` listing route |
| `/faq` | `[locale]/faq/page.tsx` | `faqItems` | Same path in both locales |
| `/search` | `[locale]/search/page.tsx` | `search` (plugin index) | Indexes `insights` only |
| `/customer-service/request-a-refund` | `[locale]/customer-service/request-a-refund/page.tsx` | `pages` | A `pages` document rendered at a fixed path; the refund form is the `claimForm` block inside it |

Globals on every page: `header`, `footer` and `settings`, via
`getCachedGlobal` in `[locale]/layout.tsx` and the Header/Footer components.

## Things that apply to all of them

**No `generateStaticParams`.** SSG plus this app's next-intl setup throws
`DYNAMIC_SERVER_USAGE` the first time a page regenerates after a content edit —
it took `/machines/[family]` down in production once. The comment in that file
is a warning, not an implementation. Every content route is server-rendered on
demand.

**Locale prefixing is not automatic.** `localePrefix: 'as-needed'` means an
un-prefixed path resolves to EN, and slugs are translated, so a link built by
hand 404s in ES. Build hrefs with `localizeHref` (`utilities/localeUrl.ts`) —
`CMSLink`, `Card`, `Pagination` and `RichText` already do.

**Only `/machines/*` has a localized path segment** (`/maquinas/...`). Everything
else keeps its English segment in both locales and differs only by the `/es`
prefix and the slug.

Ojo con la consecuencia de que el padre sea una Page y los hijos rutas de
código: **la jerarquía está gobernada por dos mecanismos**. El segmento español
del padre sale del slug del documento, en `/admin`; el de los hijos, de
`pathnames` en `i18n/routing.ts` más `machinesSegment` en
`utilities/localeUrl.ts`. Cambiar uno sin el otro deja el padre en `/maquinas` y
los hijos colgando de otro segmento, sin que nada avise en tiempo de build.

**Documents are read with `overrideAccess: false`** (or `draft` where preview
applies), so unpublished content is invisible to anonymous visitors — that is
what makes "unpublish" mean "signed-in users only". Publish status is *per
document, not per locale*: `_status` lives on the parent table, so unpublishing
in ES unpublishes EN too.

**`GATED_PATHS`** can put any of these behind a Payload session while copy is
being reviewed — see `utilities/gatedPaths.ts`. It hides, it does not protect.

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'

// 'en' is the default locale (see payload.config.ts) and has no URL prefix;
// every other locale is prefixed (e.g. /es/...) — matches [locale]/[slug]/page.tsx's routing.
const LOCALES = ['en', 'es'] as const
const DEFAULT_LOCALE = 'en'

function localizedPath(locale: string, slugPath: string): string {
  if (locale === DEFAULT_LOCALE) return slugPath
  return slugPath === '/' ? `/${locale}` : `/${locale}${slugPath}`
}

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const dateFallback = new Date().toISOString()
    const sitemap: { loc: string; lastmod: string }[] = []

    for (const locale of LOCALES) {
      sitemap.push(
        { loc: `${SITE_URL}${localizedPath(locale, '/search')}`, lastmod: dateFallback },
        { loc: `${SITE_URL}${localizedPath(locale, '/insights')}`, lastmod: dateFallback },
      )

      const results = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        locale,
        where: {
          _status: {
            equals: 'published',
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const page of results.docs ?? []) {
        if (!page?.slug) continue
        const path = page.slug === 'home' ? '/' : `/${page.slug}`
        sitemap.push({
          loc: `${SITE_URL}${localizedPath(locale, path)}`,
          lastmod: page.updatedAt || dateFallback,
        })
      }
    }

    return sitemap
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}

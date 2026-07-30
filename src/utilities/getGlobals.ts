import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { type DataFromGlobalSlug, type GlobalSlug, getPayload } from 'payload'

type Global = GlobalSlug

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

// `depth` belongs in the cache key: it changes the shape of the result (a
// relationship comes back as an id at depth 0 and as a whole document at
// depth 1), and callers ask for different depths for the same global — the
// Header reads settings at depth 0 while the layout reads it at depth 1. With
// the key built only from slug+locale, both share one entry and whichever runs
// first decides what the other one sees.
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale = 'en') =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, locale, String(depth)], {
    tags: [`global_${slug}`],
  })

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import type { Config } from 'src/payload-types'

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

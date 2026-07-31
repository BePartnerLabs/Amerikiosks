import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { type DataFromGlobalSlug, type GlobalSlug, getPayload } from 'payload'
import { stripFormIntegrationFields } from '@/utilities/stripFormIntegrationFields'

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
    // These globals are fetched to render the public site, so they must be read
    // with a visitor's permissions — the Local API defaults to `true`, which
    // skips field-level access entirely.
    //
    // It matters because of depth: Header and Footer are read at depth 1, and a
    // link field with `type: 'modal'` relates to `forms`, so depth 1 populates
    // the whole form document. That object is then handed to FormDrawerTrigger,
    // a client component, which serializes it into the RSC payload of every
    // page — publishing each form's Monday board id, group id and per-field
    // column mapping to every visitor, on every page, and caching it in the
    // `global_header`/`global_footer` entries on top.
    //
    // Nothing in the render needs those fields: the drawer and FormBlock read
    // title, fields, labels and confirmation only.
    overrideAccess: false,
  })

  return stripFormIntegrationFields(global) as DataFromGlobalSlug<T>
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

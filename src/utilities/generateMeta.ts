import type { Metadata } from 'next'

import type { Config, Insight, Machine, Media, Page, Project } from '../payload-types'
import { absoluteUrl } from './absoluteUrl'
import { getServerSideURL } from './getURL'
import type { AppLocale } from './localeUrl'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = `${serverUrl}/logos/logo-1.svg`

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    const candidate = ogUrl || image.url
    if (candidate) url = absoluteUrl(candidate, serverUrl)
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Insight> | Partial<Project> | Partial<Machine> | null
  /**
   * Canonical path of the page, locale prefix included (e.g. `/es/maquinas/zeta`).
   * Build it with the helpers in `./localeUrl`. Resolved against `metadataBase`
   * (set in the frontend layout), so a relative path is what belongs here.
   *
   * Without it `og:url` falls back to the site root, which is what every page
   * used to report — sharing any page linked to the home page.
   */
  path?: string
  /**
   * hreflang map (`{ en: '/faq', es: '/es/faq' }`). Only pass it when the path
   * for every locale is known: routes whose slug is translated per locale need
   * a lookup that metadata generation doesn't do, and a wrong hreflang is worse
   * than none.
   */
  languages?: Partial<Record<AppLocale, string>>
}): Promise<Metadata> => {
  const { doc, path, languages } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? `${doc?.meta?.title} | Amerikiosks` : 'Amerikiosks'

  return {
    description: doc?.meta?.description,
    ...(path || languages
      ? {
          alternates: {
            ...(path ? { canonical: path } : {}),
            ...(languages ? { languages } : {}),
          },
        }
      : {}),
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path ?? '/',
    }),
    title,
  }
}

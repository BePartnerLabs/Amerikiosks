import type { CollectionSlug, PayloadRequest } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  insights: '/insights',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, req }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const locale = (req.locale as string) ?? 'en'
  const localePrefix = locale === 'en' ? '' : `/${locale}`

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${localePrefix}${collectionPrefixMap[collection]}/${encodedSlug}`,
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}

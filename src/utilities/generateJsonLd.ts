const SITE_NAME = 'Amerikiosks'

export const generateOrganizationJsonLd = (args: {
  serverUrl: string
  brandDescription?: string | null
  contactEmail?: string | null
  socialUrls?: (string | null | undefined)[] | null
}) => {
  const { serverUrl, brandDescription, contactEmail, socialUrls } = args
  // `sameAs` is how search engines tie official social profiles to the brand.
  const sameAs = (socialUrls ?? []).filter((url): url is string => Boolean(url))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: serverUrl,
    logo: `${serverUrl}/logos/logo-1.svg`,
    ...(brandDescription && { description: brandDescription }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(contactEmail && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: contactEmail,
        contactType: 'sales',
      },
    }),
  }
}

export const generateWebsiteJsonLd = (args: { serverUrl: string }) => {
  const { serverUrl } = args

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: serverUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${serverUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * `Article` for an insight.
 *
 * The site-wide `Organization` and `WebSite` say who publishes; this says what
 * a given page *is*, who wrote it and when. That matters beyond classic SEO:
 * a generative engine quoting an article wants an author and a date to attach
 * the claim to, and attribution is the mechanism by which those answers send
 * anyone back here.
 *
 * Every field is conditional. Schema.org is happy with a partial Article, and
 * emitting `author: undefined` or an empty date is worse than omitting it —
 * a validator flags it and a consumer has to special-case it.
 */
export const generateArticleJsonLd = (args: {
  serverUrl: string
  url: string
  headline?: string | null
  description?: string | null
  imageUrl?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authors?: (string | null | undefined)[] | null
}) => {
  const { serverUrl, url, headline, description, imageUrl, datePublished, dateModified } = args
  const authors = (args.authors ?? []).filter((name): name is string => Boolean(name))

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    ...(headline && { headline }),
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    ...(datePublished && { datePublished }),
    // Falls back to the publication date: an article that was never edited was
    // last modified when it went out, and saying nothing loses the signal.
    ...((dateModified || datePublished) && { dateModified: dateModified || datePublished }),
    ...(authors.length > 0 && {
      author: authors.map((name) => ({ '@type': 'Person', name })),
    }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${serverUrl}/logos/logo-1.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }
}

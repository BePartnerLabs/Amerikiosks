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

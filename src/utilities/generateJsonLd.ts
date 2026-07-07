const SITE_NAME = 'Amerikiosks'

export const generateOrganizationJsonLd = (args: {
  serverUrl: string
  brandDescription?: string | null
  contactEmail?: string | null
}) => {
  const { serverUrl, brandDescription, contactEmail } = args

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: serverUrl,
    logo: `${serverUrl}/logos/logo-1.svg`,
    ...(brandDescription && { description: brandDescription }),
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

import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Retail automation solutions for brands, venues, and agencies.',
  // Raster, not the SVG logo — social crawlers don't render SVG. The explicit
  // dimensions let platforms lay the card out before the image finishes loading.
  images: [
    {
      url: `${getServerSideURL()}/og-default.png`,
      width: 1200,
      height: 630,
    },
  ],
  siteName: 'Amerikiosks',
  title: 'Amerikiosks',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}

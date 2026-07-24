import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Retail automation solutions for brands, venues, and agencies.',
  images: [
    {
      url: `${getServerSideURL()}/logos/logo-1.svg`,
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

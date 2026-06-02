import type React from 'react'
import './styles.css'
import type { Media, TrustStripBlock as TrustStripBlockProps } from '@/payload-types'
import { TrustStripCarousel } from './Carousel'

type Partner = {
  id: string
  name: string
  logo: Pick<Media, 'url'> & Partial<Media>
  order?: number | null
}

type Props = TrustStripBlockProps & {
  partners: Partner[]
}

const buildJsonLd = (heading: string, partners: Partner[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: heading,
  numberOfItems: partners.length,
  itemListElement: partners.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
  })),
})

export const TrustStripBlock: React.FC<Props> = ({ eyebrow, heading, partners }) => {
  if (!heading || !partners?.length) return null

  const carouselPartners = partners.map((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: p.logo.url ?? '',
  }))

  return (
    <section
      className="ak-trust-strip"
      aria-label={heading}
      style={{ containerType: 'inline-size', containerName: 'trust-strip' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(heading, partners)) }}
      />
      {eyebrow && <p className="ak-trust-strip__eyebrow">{eyebrow}</p>}
      <h2 className="ak-trust-strip__heading">{heading}</h2>
      <TrustStripCarousel partners={carouselPartners} />
    </section>
  )
}

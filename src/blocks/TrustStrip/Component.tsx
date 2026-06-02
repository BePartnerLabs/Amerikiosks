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
      {eyebrow && <p className="ak-trust-strip__eyebrow">{eyebrow}</p>}
      <h2 className="ak-trust-strip__heading">{heading}</h2>
      <TrustStripCarousel partners={carouselPartners} />
    </section>
  )
}

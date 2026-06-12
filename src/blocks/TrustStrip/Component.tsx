import type React from 'react'
import './styles.css'
import { SectionHeader } from '@/components/SectionHeader'
import type { Media, TrustStripBlock as TrustStripBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { TrustStripCarousel } from './Carousel'

export type TrustStripPartner = {
  id: string | number
  name: string
  logo: number | (Pick<Media, 'url'> & Partial<Media>)
  order?: number | null
}

type Props = TrustStripBlockProps & {
  partners: TrustStripPartner[]
}

const buildJsonLd = (heading: string, partners: TrustStripPartner[]) => ({
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

export const TrustStripBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  partners,
  blockName,
  blockType,
}) => {
  if (!heading || !partners?.length) return null

  const carouselPartners = partners.map((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: typeof p.logo === 'object' ? (p.logo.url ?? '') : '',
  }))

  return (
    <section
      className="ak-trust-strip"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(heading, partners)) }}
      />
      <SectionHeader
        eyebrow={eyebrow}
        heading={heading}
        align="center"
      />
      <TrustStripCarousel partners={carouselPartners} />
    </section>
  )
}

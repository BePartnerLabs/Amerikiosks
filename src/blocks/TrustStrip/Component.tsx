import Image from 'next/image'
import type React from 'react'
import './styles.css'
import type { Media, TrustStripBlock as TrustStripBlockProps } from '@/payload-types'

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

  return (
    <section
      className="ak-trust-strip"
      aria-label={heading}
      style={{ containerType: 'inline-size', containerName: 'trust-strip' }}
    >
      {eyebrow && <p className="ak-trust-strip__eyebrow">{eyebrow}</p>}
      <h2 className="ak-trust-strip__heading">{heading}</h2>

      <div className="ak-trust-strip__viewport">
        {[0, 1].map((i) => (
          <ul
            key={i}
            className="ak-trust-strip__track"
            aria-hidden={i === 1 ? 'true' : undefined}
          >
            {partners.map((partner) => (
              <li
                key={`${i}-${partner.id}`}
                className="ak-trust-strip__card"
              >
                <Image
                  src={partner.logo.url ?? ''}
                  alt={partner.name}
                  width={120}
                  height={60}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}

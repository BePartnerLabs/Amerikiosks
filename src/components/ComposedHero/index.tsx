import Image from 'next/image'
import type { CSSProperties } from 'react'
import './styles.css'

type Props = {
  eyebrow?: string | null
  heading: string
  headingStyle?: CSSProperties
  subheading?: string | null
  description?: string | null
  imageUrl?: string | null
  imageAlt: string
  imageWrapStyle?: CSSProperties
  actions?: React.ReactNode
}

// Shared "text integrated on a composed image" hero — used by the family
// page (FamilyHero) and the model page (ZoomFadeHero). One image, no
// scroll-driven animation: text sits above it, the image bleeds toward the
// bottom of the stage with a scrim fading into the next section.
export const ComposedHero: React.FC<Props> = ({
  eyebrow,
  heading,
  headingStyle,
  subheading,
  description,
  imageUrl,
  imageAlt,
  imageWrapStyle,
  actions,
}) => {
  return (
    <section className="ak-composed-hero">
      <div className="ak-composed-hero__stage">
        <div className="bp-content-grid">
          <div className="content ak-composed-hero__text">
            {eyebrow && <p className="ak-composed-hero__eyebrow">{eyebrow}</p>}
            <h1
              className="ak-composed-hero__heading"
              style={headingStyle}
            >
              {heading}
            </h1>
            {subheading && <h2 className="ak-composed-hero__subheading">{subheading}</h2>}
            {description && <p className="ak-composed-hero__description">{description}</p>}
            {actions && <div className="ak-composed-hero__actions">{actions}</div>}
          </div>
        </div>

        {imageUrl && (
          <div
            className="ak-composed-hero__image-wrap"
            style={imageWrapStyle}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              className="ak-composed-hero__image"
              sizes="100vw"
            />
          </div>
        )}
        <div className="ak-composed-hero__scrim" />
      </div>
    </section>
  )
}

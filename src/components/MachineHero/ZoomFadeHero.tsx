import { ComposedHero } from '@/components/ComposedHero'
import { CMSLink } from '@/components/Link'
import type { Machine } from '@/payload-types'
import { vtName } from '@/utilities/viewTransitionName'

type Props = {
  imageUrl: string
  alt: string
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  brochureUrl?: string | null
  cta: Machine['cta']
  slug?: string | null
}

// Same composition as the family hero (ComposedHero) — no scroll-driven
// animation. Used for any model without a real 360° turntable asset set
// (see RotationScrubHero for that case).
export const ZoomFadeHero: React.FC<Props> = ({
  imageUrl,
  alt,
  eyebrow,
  heading,
  subtitle,
  brochureUrl,
  cta,
  slug,
}) => {
  return (
    <ComposedHero
      eyebrow={eyebrow}
      heading={heading}
      headingStyle={vtName('machine-name', slug)}
      description={subtitle}
      imageUrl={imageUrl}
      imageAlt={alt}
      imageWrapStyle={vtName('machine-image', slug)}
      actions={
        <>
          {brochureUrl && (
            <a
              href={brochureUrl}
              className="bp-btn bp-btn--dark"
              download
            >
              Download brochure
            </a>
          )}
          <CMSLink
            {...cta}
            appearance={cta?.appearance ?? 'outline'}
          />
        </>
      }
    />
  )
}

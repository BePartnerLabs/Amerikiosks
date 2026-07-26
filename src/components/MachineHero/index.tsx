import type { Machine, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { RotationScrubHero } from './RotationScrubHero'
import { ZoomFadeHero } from './ZoomFadeHero'
import './styles.css'

type Props = {
  machine: Machine
}

export const MachineHero: React.FC<Props> = ({ machine }) => {
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const imageUrl = getMediaUrl(image?.url)
  const brochure = typeof machine.brochure === 'object' ? (machine.brochure as Media) : null

  const frameUrls =
    machine.useRotationHero && machine.rotationFrames && machine.rotationFrames.length > 0
      ? (machine.rotationFrames
          .map((f) => {
            const media = typeof f.image === 'object' ? (f.image as Media) : null
            return getMediaUrl(media?.url)
          })
          .filter(Boolean) as string[])
      : []

  const heroText = {
    eyebrow: machine.heroEyebrow,
    heading: machine.name,
    subtitle: machine.tagline,
    brochureUrl: brochure?.url ?? null,
    cta: machine.cta,
  }

  if (frameUrls.length > 0) {
    return (
      <RotationScrubHero
        frameUrls={frameUrls}
        alt={machine.name}
        slug={machine.slug}
        {...heroText}
      />
    )
  }

  return (
    <ZoomFadeHero
      imageUrl={imageUrl}
      alt={machine.name}
      slug={machine.slug}
      {...heroText}
    />
  )
}

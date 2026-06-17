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

  const frameUrls =
    machine.useRotationHero && machine.rotationFrames && machine.rotationFrames.length > 0
      ? (machine.rotationFrames
          .map((f) => {
            const media = typeof f.image === 'object' ? (f.image as Media) : null
            return getMediaUrl(media?.url)
          })
          .filter(Boolean) as string[])
      : []

  if (frameUrls.length > 0) {
    return (
      <RotationScrubHero
        frameUrls={frameUrls}
        alt={machine.name}
        eyebrow={machine.tagline}
        heading={machine.name}
      />
    )
  }

  return (
    <ZoomFadeHero
      imageUrl={imageUrl}
      alt={machine.name}
      eyebrow={machine.tagline}
      heading={machine.name}
    />
  )
}

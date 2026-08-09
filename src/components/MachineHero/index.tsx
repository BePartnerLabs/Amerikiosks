import type { Machine, Media } from '@/payload-types'
import { buildFrameSequenceURL } from '@/utilities/buildFrameSequenceURL'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { RotationScrubHero } from './RotationScrubHero'
import { ZoomFadeHero } from './ZoomFadeHero'
import './styles.css'

type Props = {
  machine: Machine
}

export const MachineHero: React.FC<Props> = ({ machine }) => {
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const imageUrl = getMediaUrl(getBestMediaUrl(image, 1800) ?? image?.url)
  const brochure = typeof machine.brochure === 'object' ? (machine.brochure as Media) : null

  // A frame sequence is a versioned folder in R2 — `gamma-12/v0.1` — holding
  // frame-001.webp … frame-NNN.webp, built by scripts/build-frame-sequence.mjs.
  //
  // The version lives in the path, not in a `?v=` query. These URLs are composed
  // by convention and never pass through `getMediaUrl`, so they carry no cache
  // tag; overwriting a folder would leave the CDN serving half the old animation
  // and half the new one, per region, unreproducible locally. A new folder is a
  // new URL the edge has never seen.
  //
  // `frameCount` is declared rather than discovered: listing the bucket per
  // render is not free, and a declared count turns a missing frame into a
  // visible gap instead of an animation that quietly ends early.
  const sequenceUrls =
    machine.useRotationHero && machine.sequencePath && machine.frameCount
      ? Array.from({ length: machine.frameCount }, (_, i) =>
          buildFrameSequenceURL(machine.sequencePath as string, i + 1),
        )
      : null

  // Legacy path: frames uploaded one per Media document. Kept until the
  // existing machines move to a sequence folder.
  const legacyUrls =
    machine.useRotationHero && machine.rotationFrames && machine.rotationFrames.length > 0
      ? (machine.rotationFrames
          .map((f) => {
            const media = typeof f.image === 'object' ? (f.image as Media) : null
            return getMediaUrl(getBestMediaUrl(media, 1800) ?? media?.url)
          })
          .filter(Boolean) as string[])
      : []

  const frameUrls = sequenceUrls ?? legacyUrls

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

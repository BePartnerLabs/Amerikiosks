import { ComposedHero } from '@/components/ComposedHero'
import type { MachineFamily, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { vtName } from '@/utilities/viewTransitionName'

type Props = {
  family: MachineFamily
}

export const FamilyHero: React.FC<Props> = ({ family }) => {
  const lineupImage =
    typeof family.heroLineupImage === 'object' ? (family.heroLineupImage as Media) : null

  return (
    <ComposedHero
      eyebrow={family.heroEyebrow}
      heading={family.name}
      headingStyle={vtName('family-name', family.slug)}
      subheading={family.heroHeading}
      description={family.description}
      imageUrl={getMediaUrl(getBestMediaUrl(lineupImage, 1800) ?? lineupImage?.url)}
      imageAlt={`${family.name} line-up`}
      imageWrapStyle={vtName('family-image', family.slug)}
    />
  )
}

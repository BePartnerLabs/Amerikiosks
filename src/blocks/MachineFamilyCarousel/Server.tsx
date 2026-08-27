import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type {
  MachineFamily,
  MachineFamilyCarouselBlock as MachineFamilyCarouselBlockProps,
  Media,
} from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { MachineFamilyCarouselBlock } from './Component'
import type { CarouselFamily } from './types'

/**
 * 550, and the number matters — the same pit as in the rows below.
 *
 * `getBestMediaUrl` returns the first generated size whose width covers the
 * target, over thumbnail (300) → square (500x500) → small (600). `square` is a
 * forced square crop, so 301-500 is a PIT and not a ceiling: ask for 350 and
 * the machine is boxed back into a square. 550 clears it into `small`, which
 * preserves the aspect ratio.
 */
const CARD_IMAGE_WIDTH = 550

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

export const MachineFamilyCarouselServer: React.FC<MachineFamilyCarouselBlockProps> = async (
  props,
) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'machine-families',
    sort: 'name',
    depth: 1,
    limit: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    // A card shows a machine and a name. Without this, depth 1 also hydrates
    // hoverThumbnail, heroLineupImage and an image per highlight — media
    // documents nothing here reads.
    select: { name: true, slug: true, thumbnail: true, rowImage: true },
  })

  const families: CarouselFamily[] = (result.docs as MachineFamily[])
    .map((family) => ({
      id: String(family.id),
      name: family.name,
      slug: family.slug ?? '',
      // `rowImage` is the render cropped tight to the machine; `thumbnail` is
      // the square canvas every other consumer already uses. Per family, so a
      // line whose artwork has not arrived still gets a card.
      imageUrl:
        mediaUrl(family.rowImage, CARD_IMAGE_WIDTH) ?? mediaUrl(family.thumbnail, CARD_IMAGE_WIDTH),
    }))
    // No slug is nowhere to link; no image is an empty card on a track whose
    // whole job is showing the machines.
    .filter((family) => family.slug && family.imageUrl)

  if (!families.length) return null

  return (
    <MachineFamilyCarouselBlock
      eyebrow={props.eyebrow ?? null}
      heading={props.heading}
      intro={props.intro ?? null}
      families={families}
      locale={locale as 'en' | 'es'}
    />
  )
}

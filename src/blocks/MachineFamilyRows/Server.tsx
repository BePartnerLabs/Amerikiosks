import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type {
  Machine,
  MachineFamily,
  MachineFamilyRowsBlock as MachineFamilyRowsBlockProps,
  Media,
} from '@/payload-types'
import { featuredHighlight } from '@/utilities/featuredHighlight'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { MachineFamilyRowsBlock } from './Component'
import type { FamilyRow } from './types'

/**
 * 550, and the number matters — read this before changing it.
 *
 * `getBestMediaUrl` returns the FIRST generated size whose width covers the
 * target, over thumbnail (300) → square (500x500) → small (600) → medium (900).
 * `square` is a forced square crop, so it undoes a tight crop.
 *
 * That makes 301-500 a PIT, not a ceiling: anything in that range lands on
 * `square`. Below it (<=300) you get `thumbnail`, above it (>=501) you get
 * `small`, and both preserve the aspect ratio. Ask for 550 and you clear the
 * pit into `small`.
 *
 * Why not stay under 300: the row renders the image at 11.5rem (184px), so a
 * 300px source upscales on a 2x display. What 550 costs is origin bandwidth and
 * resize CPU, not bytes on the wire — next/image re-optimises from whatever it
 * is given and the delivered weight is set by `sizes`, not by this.
 */
const ROW_IMAGE_WIDTH = 550

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

/**
 * With `depth: 0` the relationship comes back as the raw id, which is all the
 * count needs — so the id is what we group by, and no machine document is ever
 * hydrated.
 */
const familyIdOf = (machine: Pick<Machine, 'family'>): string | null => {
  const family = machine.family
  if (family === null || family === undefined) return null
  return String(typeof family === 'object' ? (family as MachineFamily).id : family)
}

export const MachineFamilyRowsServer: React.FC<MachineFamilyRowsBlockProps> = async (props) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const [familyResult, machineResult] = await Promise.all([
    payload.find({
      collection: 'machine-families',
      sort: 'name',
      depth: 1,
      limit: 0,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
      // A row shows one image, and it is the family's own thumbnail. Without
      // this, depth 1 also hydrates hoverThumbnail, heroLineupImage and an
      // image per highlight — media documents nothing here reads.
      select: {
        name: true,
        slug: true,
        ctaLabel: true,
        thumbnail: true,
        rowImage: true,
        // Text only. `highlights: true` would pull each item's image as well —
        // media documents this row never renders.
        highlights: { items: { title: true, description: true, featured: true } },
      },
    }),
    // Only the count matters, so no machine is hydrated: depth 0 leaves the
    // relationship as an id and `select` drops every other field. One grouped
    // pass rather than a count query per family.
    payload.find({
      collection: 'machines',
      depth: 0,
      limit: 0,
      overrideAccess: false,
      select: { family: true },
    }),
  ])

  const countById = new Map<string, number>()
  for (const machine of machineResult.docs as Pick<Machine, 'family'>[]) {
    const id = familyIdOf(machine)
    if (id) countById.set(id, (countById.get(id) ?? 0) + 1)
  }

  const families: FamilyRow[] = (familyResult.docs as MachineFamily[])
    .map((family) => ({
      id: String(family.id),
      name: family.name,
      slug: family.slug ?? '',
      featured: featuredHighlight(family),
      // `rowImage` is the tight crop the lean-out needs; `thumbnail` is the
      // square canvas every other consumer already uses. Per family, so a line
      // whose artwork has not arrived still renders — flat, inside its card.
      imageUrl:
        mediaUrl(family.rowImage, ROW_IMAGE_WIDTH) ?? mediaUrl(family.thumbnail, ROW_IMAGE_WIDTH),
      leansOut: Boolean(mediaUrl(family.rowImage, ROW_IMAGE_WIDTH)),
      ctaLabel: family.ctaLabel ?? null,
      modelCount: countById.get(String(family.id)) ?? 0,
    }))
    // A family with no slug has nowhere to link; one with no thumbnail would
    // render an empty image well next to its text. Neither is worth showing.
    .filter((family) => family.slug && family.imageUrl)

  if (!families.length) return null

  return (
    <MachineFamilyRowsBlock
      eyebrow={props.eyebrow ?? null}
      heading={props.heading}
      intro={props.intro ?? null}
      countEyebrow={props.countEyebrow ?? null}
      countEyebrowOne={props.countEyebrowOne ?? null}
      ctaLabel={props.ctaLabel ?? null}
      soonLabel={props.soonLabel ?? null}
      soonCtaLabel={props.soonCtaLabel ?? null}
      families={families}
      locale={locale as 'en' | 'es'}
    />
  )
}

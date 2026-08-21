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
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { MachineFamilyRowsBlock } from './Component'
import type { FamilyRow } from './types'

/**
 * 250, deliberately.
 *
 * `getBestMediaUrl` returns the FIRST generated size whose width covers the
 * target, in the order thumbnail (300) → square (500×500) → small (600) → …
 * `square` is a forced square crop: ask for 350 instead of 250 and the machine
 * is boxed back into a square, undoing the tight crop the family thumbnails
 * carry. The row renders the image at 13rem, so 250 is both correct and the
 * only value that stays on `thumbnail`.
 */
const ROW_IMAGE_WIDTH = 250

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

const familySlugOf = (machine: Machine): string | null => {
  const family = machine.family
  if (!family || typeof family !== 'object') return null
  return (family as MachineFamily).slug ?? null
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
    }),
    // Every machine once, then grouped — rather than one count query per
    // family. Five round trips to answer "how many" is five too many.
    payload.find({
      collection: 'machines',
      depth: 1,
      limit: 0,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
    }),
  ])

  const countBySlug = new Map<string, number>()
  for (const machine of machineResult.docs as Machine[]) {
    const slug = familySlugOf(machine)
    if (slug) countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1)
  }

  const families: FamilyRow[] = (familyResult.docs as MachineFamily[])
    .map((family) => ({
      id: String(family.id),
      name: family.name,
      slug: family.slug ?? '',
      tagline: family.tagline ?? family.description ?? null,
      imageUrl: mediaUrl(family.thumbnail, ROW_IMAGE_WIDTH),
      ctaLabel: family.ctaLabel ?? null,
      modelCount: countBySlug.get(family.slug ?? '') ?? 0,
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
      ctaLabel={props.ctaLabel ?? null}
      soonLabel={props.soonLabel ?? null}
      soonCtaLabel={props.soonCtaLabel ?? null}
      families={families}
      locale={locale as 'en' | 'es'}
    />
  )
}

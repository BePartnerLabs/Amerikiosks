import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type {
  Machine,
  MachineFamily,
  MachineFamilyBlock as MachineFamilyBlockProps,
  Media,
} from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { MachineFamilyBlock } from './Component'
import type { FamilySection } from './types'

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

export const MachineFamilyServer: React.FC<MachineFamilyBlockProps> = async (props) => {
  const { family: familyRef, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const family =
    typeof familyRef === 'object' && familyRef
      ? (familyRef as MachineFamily)
      : ((await payload.findByID({
          collection: 'machine-families',
          id: familyRef as number,
          depth: 1,
          overrideAccess: false,
          locale: locale as 'en' | 'es',
        })) as MachineFamily)

  if (!family?.slug) return null

  // The model count is derived, never authored: an editor cannot keep a typed
  // number in step with the machines collection, and a stale count on a product
  // page is worse than no count.
  const machineResult = await payload.find({
    collection: 'machines',
    depth: 1,
    limit: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })
  const own = (machineResult.docs as Machine[]).filter(
    (machine) => familySlugOf(machine) === family.slug,
  )

  const section: FamilySection = {
    name: family.name,
    slug: family.slug,
    headline: family.highlights?.heading ?? family.tagline ?? null,
    description: family.description ?? null,
    ctaLabel: family.ctaLabel ?? null,
    frontUrl: mediaUrl(family.thumbnail, 520),
    turnUrl: mediaUrl(family.hoverThumbnail, 520),
    highlights: (family.highlights?.items ?? [])
      .filter((item) => item.title)
      .map((item) => ({
        title: item.title as string,
        description: item.description ?? null,
        imageUrl: mediaUrl(item.image, 420),
      })),
    machineShots: own
      .map((machine) => mediaUrl(machine.hoverImage, 520) ?? mediaUrl(machine.image, 520))
      .filter((url): url is string => Boolean(url)),
    modelCount: own.length,
  }

  if (!section.highlights.length) return null

  return (
    <MachineFamilyBlock
      {...rest}
      section={section}
    />
  )
}

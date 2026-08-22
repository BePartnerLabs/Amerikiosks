import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type {
  MachineFamily,
  MachineLineupBlock as MachineLineupBlockProps,
  Media,
} from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { machinesPath } from '@/utilities/localeUrl'
import { MachineLineupBlock } from './Component'
import type { LineupFamily } from './types'

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

export const MachineLineupServer: React.FC<MachineLineupBlockProps> = async (props) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'machine-families',
    sort: 'name',
    depth: 1,
    limit: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })

  const families: LineupFamily[] = (result.docs as MachineFamily[])
    .map((family) => ({
      id: String(family.id),
      name: family.name,
      slug: family.slug ?? '',
      // One machine, not the composed line — `heroLineupImage` is every model at
      // once and belongs to the family hero. `hoverThumbnail` is the
      // three-quarter view the scroll crossfades into; the name predates the
      // scene and no longer refers to a mouse hover.
      frontUrl: mediaUrl(family.thumbnail, 720),
      turnUrl: mediaUrl(family.hoverThumbnail, 720),
      tagline: family.tagline ?? null,
    }))
    .filter((family) => family.slug && family.frontUrl)

  if (!families.length) return null

  // The route this page replaces emitted a CollectionPage listing every family
  // (`machines/page.tsx`). As a pages document nothing would emit it, and today
  // that `hasPart` is the most complete machine-readable source of family URLs
  // on the site — the HTML only ever linked the selected one. This block knows
  // all five, so it carries the graph.
  const siteUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Model Lines',
    url: `${siteUrl}${machinesPath(locale as 'en' | 'es')}`,
    hasPart: families.map((family) => ({
      '@type': 'Thing',
      name: family.name,
      description: family.tagline ?? undefined,
      url: `${siteUrl}${machinesPath(locale as 'en' | 'es', family.slug)}`,
    })),
  }

  return (
    <MachineLineupBlock
      intro={props.intro ?? null}
      families={families}
      jsonLd={jsonLd}
    />
  )
}

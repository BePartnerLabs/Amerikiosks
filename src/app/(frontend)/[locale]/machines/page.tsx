import config from '@payload-config'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { TrustStripServer } from '@/blocks/TrustStrip/Server'
import {
  type FamilyView,
  MachinesFeatures,
  MachinesLandingProvider,
  MachinesModels,
  MachinesStage,
  type MachineView,
} from '@/components/MachinesLanding'
import type { Machine, MachineFamily, Media } from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { type AppLocale, machinesAlternates, machinesPath } from '@/utilities/localeUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import '@/components/MachinesLanding/styles.css'

type Args = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations('machines')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const canonical = machinesPath(locale as AppLocale)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: machinesAlternates(),
    },
    openGraph: mergeOpenGraph({ title, description, url: canonical }),
  }
}

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

/** `dimensions.height` is free text ('78.42"', '92 in'). Pull the number out. */
const inches = (value?: string | null): number | null => {
  if (!value) return null
  const match = value.match(/[\d.]+/)
  if (!match) return null
  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

const familySlugOf = (machine: Machine): string | null => {
  const family = machine.family
  if (!family || typeof family !== 'object') return null
  return family.slug ?? null
}

const toMachineView = (machine: Machine): MachineView => ({
  id: String(machine.id),
  name: machine.name,
  slug: machine.slug ?? '',
  tagline: machine.tagline ?? null,
  imageUrl: mediaUrl(machine.image, 520),
  hoverImageUrl: mediaUrl(machine.hoverImage, 520),
  specs: (machine.specs ?? [])
    .filter((spec) => spec.label && spec.value)
    .slice(0, 3)
    .map((spec) => ({ label: spec.label as string, value: spec.value as string })),
  heightIn: inches(machine.dimensions?.height),
})

export default async function MachinesLandingPage() {
  const payload = await getPayload({ config })
  const locale = (await getLocale()) as 'en' | 'es'
  const t = await getTranslations('machines')

  // One query for the lines and one for every machine: the landing needs the
  // model count, the spec preview and the real dimensions of each line, and
  // nine documents is cheaper to group in memory than five nested queries.
  const [familyResult, machineResult] = await Promise.all([
    payload.find({
      collection: 'machine-families',
      sort: 'name',
      depth: 1,
      limit: 0,
      overrideAccess: false,
      locale,
    }),
    payload.find({
      collection: 'machines',
      sort: 'name',
      depth: 1,
      limit: 0,
      overrideAccess: false,
      locale,
    }),
  ])

  const machines = machineResult.docs as Machine[]

  const families: FamilyView[] = (familyResult.docs as MachineFamily[]).map((family) => {
    const own = machines.filter((machine) => familySlugOf(machine) === family.slug)
    const views = own.map(toMachineView)
    const heights = views
      .map((view) => view.heightIn)
      .filter((value): value is number => value !== null)
    const widths = own
      .map((machine) => inches(machine.dimensions?.width))
      .filter((value): value is number => value !== null)

    return {
      id: String(family.id),
      name: family.name,
      slug: family.slug ?? '',
      tagline: family.tagline ?? null,
      headline: family.highlights?.heading ?? family.tagline ?? null,
      description: family.description ?? null,
      ctaLabel: family.ctaLabel ?? null,
      thumbUrl: mediaUrl(family.thumbnail, 320),
      hoverUrl: mediaUrl(family.hoverThumbnail, 320),
      heroUrl: mediaUrl(family.heroLineupImage, 720) ?? mediaUrl(family.thumbnail, 720),
      highlights: (family.highlights?.items ?? [])
        .filter((item) => item.title)
        .map((item) => ({
          title: item.title as string,
          description: item.description ?? null,
          imageUrl: mediaUrl(item.image, 420),
        })),
      machines: views,
      heightIn: heights.length ? Math.max(...heights) : null,
      widthIn: widths.length ? Math.max(...widths) : null,
    }
  })

  const siteUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Model Lines',
    url: `${siteUrl}/machines`,
    hasPart: families.map((family) => ({
      '@type': 'Thing',
      name: family.name,
      description: family.tagline || family.description || undefined,
      url: `${siteUrl}/machines/${family.slug}`,
    })),
  }

  if (!families.length) return null

  return (
    <main className="ak-machines-landing">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MachinesLandingProvider families={families}>
        <MachinesStage
          eyebrow={t('eyebrow')}
          heading={t('heading')}
        />

        {/* Server-rendered inside the provider: partners come from Payload,
            the sections around it react to the selected line. */}
        <TrustStripServer
          blockType="trustStrip"
          eyebrow={t('trustEyebrow')}
          heading={t('trustHeading')}
        />

        <MachinesFeatures />
        <MachinesModels />
      </MachinesLandingProvider>
    </main>
  )
}

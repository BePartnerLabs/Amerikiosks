import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ModelLinesRow } from '@/components/ModelLinesRow'
import { SectionHeader } from '@/components/SectionHeader'
import type { Machine, MachineFamily, MachineInstallation } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { FamilyHero } from './FamilyHero'
import { FamilyHighlights } from './FamilyHighlights'
import { InstallationsGallery } from './InstallationsGallery'
import '../machines-catalog.css'
import './[slug]/machine-detail.css'
import { ModelsCarousel } from './ModelsCarousel'
import { SpecsCompare } from './SpecsCompare'

type Props = {
  params: Promise<{ locale: string; family: string }>
}

export async function getFamilyBySlug(slug: string, locale: 'en' | 'es') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machine-families',
    where: { slug: { equals: slug } },
    depth: 1,
    overrideAccess: false,
    locale,
    limit: 1,
  })
  return (result.docs[0] as MachineFamily) ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machine-families',
    depth: 0,
    overrideAccess: false,
    limit: 100,
  })

  return (result.docs as MachineFamily[])
    .filter((family) => Boolean(family.slug))
    .map((family) => ({ family: family.slug as string }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { family: familySlug, locale: rawLocale } = await params
  const locale = rawLocale as 'en' | 'es'
  const family = await getFamilyBySlug(familySlug, locale)
  if (!family) return {}

  return generateMeta({
    doc: {
      ...family,
      meta: {
        title: family.meta?.title ?? family.name,
        description: family.meta?.description ?? family.tagline,
        image: family.meta?.image,
      },
    },
  })
}

export default async function FamilyDetailPage({ params }: Props) {
  const { family: familySlug, locale: rawLocale } = await params
  const locale = rawLocale as 'en' | 'es'
  const payload = await getPayload({ config })

  const family = await getFamilyBySlug(familySlug, locale)
  if (!family) notFound()

  const [allFamilies, modelsResult] = await Promise.all([
    payload.find({
      collection: 'machine-families',
      sort: 'name',
      depth: 1,
      overrideAccess: false,
      locale,
    }),
    payload.find({
      collection: 'machines',
      where: { family: { equals: family.id } },
      depth: 1,
      overrideAccess: false,
      locale,
    }),
  ])

  const models = modelsResult.docs as Machine[]
  const modelIds = models.map((m) => m.id)

  const installationsResult =
    modelIds.length > 0
      ? await payload.find({
          collection: 'machine-installations',
          where: { machine: { in: modelIds } },
          depth: 2,
          overrideAccess: false,
          limit: 12,
        })
      : null

  const installations = (installationsResult?.docs ?? []) as MachineInstallation[]
  const highlightItems = family.highlights?.items ?? []

  const siteUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Machines', item: `${siteUrl}/machines` },
          {
            '@type': 'ListItem',
            position: 2,
            name: family.name,
            item: `${siteUrl}/machines/${familySlug}`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: family.name,
        description: family.description || family.tagline || undefined,
        url: `${siteUrl}/machines/${familySlug}`,
        hasPart: models.map((machine) => ({
          '@type': 'Product',
          name: machine.name,
          url: `${siteUrl}/machines/${familySlug}/${machine.slug}`,
        })),
      },
    ],
  }

  return (
    <main className="ak-family-detail">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="ak-family-detail__nav">
        <div className="bp-content-grid">
          <div className="breakout">
            <ModelLinesRow
              families={allFamilies.docs as MachineFamily[]}
              activeSlug={family.slug ?? undefined}
            />
          </div>
        </div>
      </section>

      <FamilyHero family={family} />

      {family.highlights && highlightItems.length > 0 && (
        <FamilyHighlights highlights={family.highlights} />
      )}

      <SpecsCompare models={models} />

      {models.length > 0 && (
        <section className="ak-family-detail__models">
          <div className="bp-content-grid">
            <div className="content ak-family-detail__models-inner">
              <SectionHeader
                eyebrow="Models"
                heading={`Explore the ${family.name} line.`}
              />
            </div>
          </div>
          <ModelsCarousel
            familySlug={family.slug ?? ''}
            models={models}
          />
        </section>
      )}

      <InstallationsGallery installations={installations} />

      <CallToActionBlock
        blockType="cta"
        richText={{
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h2',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Not sure which ${family.name} model fits your location?`,
                  },
                ],
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        }}
        links={[
          {
            link: {
              label: 'Talk to sales',
              type: 'custom',
              url: '/contact',
              appearance: 'default',
            },
          },
          {
            link: {
              label: 'View all lines',
              type: 'custom',
              url: '/machines',
              appearance: 'outline',
            },
          },
        ]}
      />
    </main>
  )
}

import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { MachineHero } from '@/components/MachineHero'
import type { Machine, MachineFamily, Media } from '@/payload-types'
import { absoluteUrl } from '@/utilities/absoluteUrl'
import { generateMeta } from '@/utilities/generateMeta'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { machinesAlternates, machinesPath } from '@/utilities/localeUrl'
import { Capabilities } from './Capabilities'
import { Dimensions } from './Dimensions'
import { Highlights } from './Highlights'
import './machine-detail.css'
import { RelatedMachines } from './RelatedMachines'

type Props = {
  params: Promise<{ locale: string; family: string; slug: string }>
}

async function getMachine(familySlug: string, slug: string, locale: 'en' | 'es') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machines',
    where: { slug: { equals: slug } },
    depth: 2,
    overrideAccess: false,
    locale,
    limit: 1,
  })
  const machine = (result.docs[0] as Machine) ?? null
  if (!machine) return null

  const family = typeof machine.family === 'object' ? (machine.family as MachineFamily) : null
  // The family segment in the URL must match the machine's real family — otherwise
  // /machines/wrong-family/alpha-13 would render as if it were correct.
  if (family?.slug !== familySlug) return null

  return machine
}

// See the matching comment in ../page.tsx — dropped generateStaticParams,
// same DYNAMIC_SERVER_USAGE fix, same pattern as every other content route.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { family, slug, locale: rawLocale } = await params
  const locale = rawLocale as 'en' | 'es'
  const machine = await getMachine(family, slug, locale)
  if (!machine) return {}
  return generateMeta({
    doc: {
      ...machine,
      meta: {
        title: machine.meta?.title ?? machine.name,
        description: machine.meta?.description ?? machine.tagline,
        image: machine.meta?.image ?? machine.image,
      },
    },
    path: machinesPath(locale, family, slug),
    languages: machinesAlternates(family, slug),
  })
}

export default async function MachineDetailPage({ params }: Props) {
  const { family: familySlug, slug, locale: rawLocale } = await params
  const locale = rawLocale as 'en' | 'es'
  const machine = await getMachine(familySlug, slug, locale)

  if (!machine) notFound()

  const family = typeof machine.family === 'object' ? (machine.family as MachineFamily) : null
  const ctaLabel = machine.cta?.label || 'Contact Sales'
  const ctaUrl = machine.cta?.url || '/contact'
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const siteUrl = getServerSideURL()
  const canonicalPath = `/machines/${familySlug}/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Machines', item: `${siteUrl}/machines` },
          ...(family
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: family.name,
                  item: `${siteUrl}/machines/${familySlug}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: family ? 3 : 2,
            name: machine.name,
            item: `${siteUrl}${canonicalPath}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: machine.name,
        description: machine.tagline || machine.meta?.description || undefined,
        image: image?.url ? absoluteUrl(image.url, siteUrl) : undefined,
        brand: { '@type': 'Brand', name: 'Amerikiosks' },
        ...(family ? { category: family.name } : {}),
        url: `${siteUrl}${canonicalPath}`,
      },
    ],
  }

  return (
    <main className="ak-machine-detail">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MachineHero machine={machine} />

      {machine.highlights && <Highlights highlights={machine.highlights} />}

      {machine.capabilities && (
        <Capabilities
          capabilities={machine.capabilities}
          gallery={machine.gallery}
        />
      )}

      {/* Sin condicion aqui a proposito: `Dimensions` decide si tiene algo que
          mostrar —diagramas, numeros, o ambos— y devuelve null si no. Este
          guard existia y filtraba por diagramas, que es la mitad que nadie
          subio: aunque el componente ya sabia mostrar los numeros solos, la
          seccion no llegaba nunca a renderizarse. Duplicar la condicion en el
          sitio de llamada es lo que hizo que arreglar el componente no
          arreglara la pagina. */}
      <Dimensions
        diagrams={machine.dimensionDiagrams ?? []}
        dimensions={machine.dimensions}
      />

      {machine.gallery && machine.gallery.length > 0 && (
        <section className="ak-machine-detail__gallery">
          <div className="ak-machine-detail__gallery-strip">
            {machine.gallery.map((item, i) => {
              const galleryImage = typeof item.image === 'object' ? (item.image as Media) : null
              if (!galleryImage?.url) return null
              return (
                <div
                  key={item.id ?? i}
                  className="ak-machine-detail__gallery-item"
                >
                  <Image
                    src={getBestMediaUrl(galleryImage, 900) ?? galleryImage.url}
                    alt={`${machine.name} gallery image ${i + 1}`}
                    fill
                    className="ak-machine-detail__gallery-img"
                    sizes="(max-width: 640px) 90vw, 50vw"
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {family && (
        <RelatedMachines
          currentFamilyId={family.id}
          locale={locale}
        />
      )}

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
                    text: `Ready to place ${machine.name} in your location?`,
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
              label: ctaLabel,
              type: 'custom',
              url: ctaUrl,
              appearance: 'default',
            },
          },
        ]}
      />
    </main>
  )
}

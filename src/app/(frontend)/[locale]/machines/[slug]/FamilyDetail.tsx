import config from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { MachineCard } from '@/blocks/MachinesListing/MachineCard'
import { Icon } from '@/components/Icon'
import { ModelLinesRow } from '@/components/ModelLinesRow'
import { Link } from '@/i18n/routing'
import type { Machine, MachineFamily, MachineInstallation } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { InstallationsGallery } from './InstallationsGallery'
import './machines-catalog.css'

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

export async function generateFamilyMetadata(family: MachineFamily): Promise<Metadata> {
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

type Props = {
  family: MachineFamily
  locale: 'en' | 'es'
}

export const FamilyDetail: React.FC<Props> = async ({ family, locale }) => {
  const payload = await getPayload({ config })

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

  return (
    <main className="ak-family-detail">
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

      <section className="ak-family-detail__hero">
        <div className="bp-content-grid">
          <div className="content ak-family-detail__hero-inner">
            {family.tagline && <p className="ak-family-detail__eyebrow">{family.tagline}</p>}
            <h1 className="ak-family-detail__heading">{family.name}</h1>
            {family.description && (
              <p className="ak-family-detail__description">{family.description}</p>
            )}
          </div>
        </div>
      </section>

      {highlightItems.length > 0 && (
        <section className="ak-machine-detail__highlights">
          <div className="bp-content-grid">
            <div className="content ak-machine-detail__highlights-inner">
              {family.highlights?.eyebrow && (
                <p className="ak-machine-detail__highlights-eyebrow">{family.highlights.eyebrow}</p>
              )}
              {family.highlights?.heading && (
                <h2 className="ak-machine-detail__highlights-heading">
                  {family.highlights.heading}
                </h2>
              )}
              <div className="ak-machine-detail__highlights-strip">
                {highlightItems.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="ak-machine-detail__highlight-card"
                  >
                    {item.icon && (
                      <Icon
                        name={item.icon}
                        className="ak-machine-detail__highlight-icon"
                      />
                    )}
                    <p className="ak-machine-detail__highlight-title">{item.title}</p>
                    {item.description && (
                      <p className="ak-machine-detail__highlight-description">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {models.length > 0 && (
        <section className="ak-family-detail__models">
          <div className="bp-content-grid">
            <div className="content ak-family-detail__models-inner">
              <p className="ak-machine-detail__related-eyebrow">MODELS</p>
              <h2 className="ak-machine-detail__related-heading">{`Explore the ${family.name} line.`}</h2>
              <div className="ak-machines-listing__grid">
                {models.map((machine, i) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <InstallationsGallery installations={installations} />

      <section className="ak-family-detail__footer-cta">
        <div className="bp-content-grid">
          <div className="content ak-family-detail__footer-cta-inner">
            <Link
              href="/machines"
              className="bp-btn"
            >
              View all lines
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

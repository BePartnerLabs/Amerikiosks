import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { MachineHero } from '@/components/MachineHero'
import type { Machine, Media } from '@/payload-types'
import './machine-detail.css'

type Props = {
  params: Promise<{ slug: string }>
}

async function getMachine(slug: string, locale: 'en' | 'es') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machines',
    where: { slug: { equals: slug } },
    depth: 2,
    overrideAccess: false,
    locale,
    limit: 1,
  })
  return (result.docs[0] as Machine) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const machine = await getMachine(slug, locale as 'en' | 'es')
  if (!machine) return {}
  return {
    title: `${machine.name} — Amerikiosks`,
    description: machine.tagline ?? undefined,
  }
}

export default async function MachineDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const machine = await getMachine(slug, locale as 'en' | 'es')

  if (!machine) notFound()

  const ctaLabel = machine.cta?.label || 'Request a quote'
  const ctaUrl = machine.cta?.url || '/contact'

  return (
    <main className="ak-machine-detail">
      <MachineHero machine={machine} />

      <div className="ak-machine-detail__cta-bar">
        <div className="bp-content-grid">
          <div className="content ak-machine-detail__cta-bar-inner">
            <span className="ak-machine-detail__cta-bar-name">{machine.name}</span>
            <Link
              href={ctaUrl}
              className="bp-btn bp-btn--primary"
              data-ga-event="machine_cta_click"
              data-ga-label={machine.name}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>

      {machine.gallery && machine.gallery.length > 0 && (
        <section className="ak-machine-detail__gallery">
          <div className="ak-machine-detail__gallery-strip">
            {machine.gallery.map((item, i) => {
              const image = typeof item.image === 'object' ? (item.image as Media) : null
              if (!image?.url) return null
              return (
                <div
                  key={item.id ?? i}
                  className="ak-machine-detail__gallery-item"
                >
                  <Image
                    src={image.url}
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
    </main>
  )
}

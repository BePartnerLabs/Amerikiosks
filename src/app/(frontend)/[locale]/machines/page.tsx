import config from '@payload-config'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { ModelLinesRow } from '@/components/ModelLinesRow'
import { Link } from '@/i18n/routing'
import type { MachineFamily } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { type AppLocale, machinesAlternates, machinesPath } from '@/utilities/localeUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import './machines-catalog.css'

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

export default async function MachinesLandingPage() {
  const payload = await getPayload({ config })
  const locale = (await getLocale()) as 'en' | 'es'
  const t = await getTranslations('machines')

  const result = await payload.find({
    collection: 'machine-families',
    sort: 'name',
    depth: 1,
    overrideAccess: false,
    locale,
  })

  const families = result.docs as MachineFamily[]

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

  return (
    <main className="ak-machines-landing">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="ak-machines-landing__nav">
        <div className="bp-content-grid">
          <div className="breakout">
            <h1 className="ak-machines-landing__title">{t('heading')}</h1>
            <ModelLinesRow
              families={families}
              locale={locale}
            />
          </div>
        </div>
      </section>

      {families.map((family) => {
        const items = family.highlights?.items ?? []

        return (
          <section
            key={family.id}
            id={family.slug ?? undefined}
            className="ak-machines-landing__section"
          >
            <div className="bp-content-grid">
              <div className="content">
                <div className="ak-machines-landing__section-head">
                  <div className="ak-machines-landing__section-title">
                    {family.tagline && (
                      <p className="ak-machines-landing__section-eyebrow">{family.name}</p>
                    )}
                    {family.highlights?.heading && (
                      <h2 className="ak-machines-landing__section-heading">
                        {family.highlights.heading}
                      </h2>
                    )}
                    {family.description && (
                      <p className="ak-machines-landing__section-subheading">
                        {family.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={{ pathname: '/machines/[family]', params: { family: family.slug ?? '' } }}
                    className="bp-btn bp-btn--secondary"
                  >
                    {family.ctaLabel || t('knowMore')}
                  </Link>
                </div>

                {items.length > 0 && (
                  <div className="ak-machines-landing__cards">
                    {items.map((item, i) => (
                      <div
                        key={item.id ?? i}
                        className="ak-machines-landing__card"
                      >
                        <p className="ak-machines-landing__card-title">{item.title}</p>
                        {item.description && (
                          <p className="ak-machines-landing__card-description">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </main>
  )
}

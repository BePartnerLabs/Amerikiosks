import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { type AppLocale, languageAlternates, withLocale } from '@/utilities/localeUrl'
import PageClient from '../../[slug]/page.client'

// Dedicated route (not the generic single-segment [slug] page) so this URL
// resolves to exactly /customer-service/request-a-refund — printed on
// physical QR codes on deployed kiosks, see docs/analytics-migration-report.md.
const SLUG = 'customer-service-request-a-refund'

type Args = {
  params: Promise<{ locale: string }>
}

export default async function CustomerServiceRequestARefundPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale } = await paramsPromise

  const page = await queryPage({ locale })

  if (!page) {
    return <PayloadRedirects url="/customer-service/request-a-refund" />
  }

  const { hero, layout, breadcrumbs } = page

  return (
    <article data-slug={SLUG}>
      <PageClient />
      {draft && <LivePreviewListener />}
      <RenderHero
        {...hero}
        breadcrumbs={breadcrumbs}
      />
      {layout && <RenderBlocks blocks={layout} />}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const page = await queryPage({ locale })
  return generateMeta({
    doc: page,
    path: withLocale('/customer-service/request-a-refund', locale as AppLocale),
    languages: languageAlternates('/customer-service/request-a-refund'),
  })
}

const queryPage = cache(async ({ locale }: { locale: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    where: { slug: { equals: SLUG } },
  })

  return result.docs?.[0] || null
})

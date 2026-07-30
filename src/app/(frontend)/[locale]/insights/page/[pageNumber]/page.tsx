import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { type AppLocale, languageAlternates, withLocale } from '@/utilities/localeUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import PageClient from './page.client'

type Args = {
  params: Promise<{
    pageNumber: string
    locale: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber, locale } = await paramsPromise
  const t = await getTranslations('insights')
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'insights',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
  })

  return (
    <div className="">
      <PageClient />
      <div className="">
        <div className="">
          <h1>{t('heading')}</h1>
        </div>
      </div>

      <div className="">
        <PageRange
          collection="insights"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, locale } = await paramsPromise
  const t = await getTranslations('insights')
  const title = t('pageMetaTitle', { page: pageNumber || '' })
  const description = t('metaDescription')
  const path = `/insights/page/${pageNumber}`
  const canonical = withLocale(path, locale as AppLocale)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: mergeOpenGraph({ title, description, url: canonical }),
  }
}

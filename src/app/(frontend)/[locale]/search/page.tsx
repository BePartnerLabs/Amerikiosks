import configPromise from '@payload-config'
import type { Metadata } from 'next/types'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import type { CardPostData } from '@/components/Card'
import { CollectionArchive } from '@/components/CollectionArchive'
import { Search } from '@/search/Component'
import { type AppLocale, withLocale } from '@/utilities/localeUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import PageClient from './page.client'

type Args = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise
  const { q: query } = await searchParamsPromise
  const t = await getTranslations('search')
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale: locale as 'en' | 'es',
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="">
      <PageClient />
      <div className="">
        <div className="">
          <h1 className="">{t('heading')}</h1>

          <div className="">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="">
          {t('noResults')} {query}
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations('search')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const canonical = withLocale('/search', locale as AppLocale)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: mergeOpenGraph({ title, description, url: canonical }),
    // Search-result pages are dynamic/query-driven and shouldn't be indexed
    robots: { index: false, follow: true },
  }
}

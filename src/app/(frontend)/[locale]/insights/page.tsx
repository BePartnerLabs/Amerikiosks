import configPromise from '@payload-config'
import type { Metadata } from 'next/types'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  const t = await getTranslations('insights')
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'insights',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
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
        {posts.totalPages > 1 && posts.page && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
          />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Amerikiosks Insights`,
  }
}

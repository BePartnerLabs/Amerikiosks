import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { routing } from '@/i18n/routing'
import PageClient from './page.client'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
    locale: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber, locale } = await paramsPromise
  const t = await getTranslations('posts')
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
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
          collection="posts"
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
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)
  const params: { locale: string; pageNumber: string }[] = []

  for (const locale of routing.locales) {
    for (let i = 1; i <= totalPages; i++) {
      params.push({ locale, pageNumber: String(i) })
    }
  }

  return params
}

import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'

import { PostHero } from '@/heros/PostHero'
import { routing } from '@/i18n/routing'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const params: { locale: string; slug: string }[] = []

  for (const locale of routing.locales) {
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      locale,
      select: { slug: true },
    })

    for (const doc of posts.docs) {
      if (doc.slug) {
        params.push({ locale, slug: doc.slug as string })
      }
    }
  }

  return params
}

type Args = {
  params: Promise<{
    slug?: string
    locale: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', locale } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/posts/${decodedSlug}`
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects
        disableNotFound
        url={url}
      />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="">
        <div className="">
          <RichText
            className=""
            data={post.content}
            enableGutter={false}
          />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className=""
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

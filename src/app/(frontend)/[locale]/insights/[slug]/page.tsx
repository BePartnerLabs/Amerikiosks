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
import { absoluteUrl } from '@/utilities/absoluteUrl'
import { generateArticleJsonLd } from '@/utilities/generateJsonLd'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { jsonLdString } from '@/utilities/jsonLdString'
import { type AppLocale, withLocale } from '@/utilities/localeUrl'
import PageClient from './page.client'

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

  // What the page *is*, on top of the site-wide Organization/WebSite. A
  // generative engine quoting this wants an author and a date to attach the
  // claim to, and attribution is how those answers send anyone back here.
  const serverUrl = getServerSideURL()
  const heroImage = typeof post.heroImage === 'object' ? post.heroImage : undefined
  const metaImage = typeof post.meta?.image === 'object' ? post.meta?.image : undefined
  const imageCandidate = heroImage?.sizes?.og?.url || heroImage?.url || metaImage?.url
  const articleJsonLd = generateArticleJsonLd({
    serverUrl,
    url: `${serverUrl}${withLocale(`/insights/${decodedSlug}`, locale as AppLocale)}`,
    headline: post.meta?.title || post.title,
    description: post.meta?.description,
    imageUrl: imageCandidate ? absoluteUrl(imageCandidate, serverUrl) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authors: (post.populatedAuthors ?? []).map((a) => a?.name),
  })

  return (
    <article className="">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped via jsonLdString, but CMS-entered content still passes through this tag
        dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd) }}
      />
      <PageClient />

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

  // No `languages`: insights slugs are translated per locale, and a wrong
  // hreflang would be worse than none.
  const path = withLocale(`/insights/${decodedSlug}`, locale as AppLocale)

  return generateMeta({ doc: post, path })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'insights',
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

import configPromise from '@payload-config'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'
import { cache } from 'react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import type { Media } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import PageClient from './page.client'

type Args = {
  params: Promise<{ slug?: string; locale: string }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', locale } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = `/projects/${decodedSlug}`
  const project = await queryProjectBySlug({ slug: decodedSlug, locale })

  if (!project) return <PayloadRedirects url={url} />

  const heroImg =
    project.image && typeof project.image === 'object' ? (project.image as Media) : null

  return (
    <article>
      <PageClient />
      <PayloadRedirects
        disableNotFound
        url={url}
      />
      {draft && <LivePreviewListener />}

      {heroImg?.url && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <Image
            src={getBestMediaUrl(heroImg, 1800) ?? heroImg.url}
            alt={heroImg.alt ?? project.title}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="bp-content-grid">
        <div
          className="content"
          style={{ paddingBlock: '4rem' }}
        >
          {project.category && (
            <p style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
              {project.category}
            </p>
          )}
          <h1>{project.title}</h1>
          {project.description && <p>{project.description}</p>}
          {project.body && (
            <RichText
              data={project.body as DefaultTypedEditorState}
              enableGutter={false}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  const project = await queryProjectBySlug({ slug: decodeURIComponent(slug), locale })
  if (!project) return {}
  return generateMeta({
    doc: {
      ...project,
      meta: {
        title: project.meta?.title ?? project.title,
        description: project.meta?.description ?? project.description,
        image: project.meta?.image ?? project.image,
      },
    },
  })
}

const queryProjectBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] ?? null
})

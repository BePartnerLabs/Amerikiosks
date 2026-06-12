import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'
import { cache } from 'react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { routing } from '@/i18n/routing'
import type { Media } from '@/payload-types'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const params: { locale: string; slug: string }[] = []

  for (const locale of routing.locales) {
    const projects = await payload.find({
      collection: 'projects',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      locale,
      select: { slug: true },
    })

    for (const doc of projects.docs) {
      if (doc.slug) {
        params.push({ locale, slug: doc.slug })
      }
    }
  }

  return params
}

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
            src={heroImg.url}
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
              // biome-ignore lint/suspicious/noExplicitAny: Payload richText type mismatch with lexical
              data={project.body as any}
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
  return { title: project.title, description: project.description ?? undefined }
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

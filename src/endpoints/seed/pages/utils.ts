import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Payload, PayloadRequest } from 'payload'

type PageExtra = Partial<Omit<RequiredDataFromCollectionSlug<'pages'>, 'title' | 'slug'>>

export const upsertPage = async (
  payload: Payload,
  req: PayloadRequest,
  en: { title: string; slug: string } & PageExtra,
  es: { title: string; slug: string } & PageExtra,
) => {
  const { title: enTitle, slug: enSlug, ...enExtra } = en

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: enSlug } },
    limit: 1,
  })

  const baseData = {
    title: enTitle,
    slug: enSlug,
    hero: { type: 'none' as const, links: [] },
    layout: [],
    _status: 'published' as const,
    ...enExtra,
  }

  const doc =
    existing.docs.length > 0
      ? await payload.update({
          collection: 'pages',
          id: existing.docs[0]!.id,
          locale: 'en',
          data: baseData,
          req: { ...req, locale: 'en' } as PayloadRequest,
        })
      : await payload.create({
          collection: 'pages',
          locale: 'en',
          data: baseData,
          req: { ...req, locale: 'en' } as PayloadRequest,
        })

  const { title: esTitle, slug: esSlug, ...esExtra } = es

  // Carry over block IDs from the EN doc so Payload updates localized fields
  // on the existing blocks rather than creating new ones (which would orphan EN content).
  const esLayout = (esExtra.layout ?? []).map((block: any, i: number) => ({
    ...block,
    id: (doc.layout as any[])?.[i]?.id ?? block.id,
  }))

  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale: 'es',
    data: {
      title: esTitle,
      slug: esSlug,
      layout: [],
      _status: 'published' as const,
      ...esExtra,
      ...(esLayout.length > 0 ? { layout: esLayout } : {}),
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
  })

  return doc
}

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

  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale: 'es',
    data: es,
    req: { ...req, locale: 'es' } as PayloadRequest,
  })

  return doc
}

import type { Payload, PayloadRequest } from 'payload'

export const upsertPage = async (
  payload: Payload,
  req: PayloadRequest,
  en: { title: string; slug: string },
  es: { title: string; slug: string },
) => {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: en.slug } },
    limit: 1,
  })

  const baseData = {
    ...en,
    hero: { type: 'none' as const, links: [] },
    layout: [],
    _status: 'published' as const,
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

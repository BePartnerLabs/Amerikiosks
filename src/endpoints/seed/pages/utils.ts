import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

type PageExtra = Partial<Omit<RequiredDataFromCollectionSlug<'pages'>, 'title' | 'slug'>>
type PageLayoutBlock = NonNullable<RequiredDataFromCollectionSlug<'pages'>['layout']>[number] & {
  id?: string | number | null
}

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
          id: existing.docs[0]?.id,
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

  // Re-fetch with depth:0 to get raw block UUIDs for the ES update.
  const rawDoc = await payload.findByID({
    collection: 'pages',
    id: doc.id,
    depth: 0,
    locale: 'en',
  })
  const enLayout = (rawDoc.layout ?? []) as PageLayoutBlock[]
  const esLayout = (esExtra.layout ?? []).map((block, i: number) => {
    const enBlock = enLayout[i] as unknown as Record<string, unknown> | undefined
    const blockId = enBlock?.id ?? (block as unknown as Record<string, unknown>).id
    // Strip items — Payload's Drizzle adapter does DELETE+INSERT (not UPDATE) for array rows
    // during locale updates, which causes uniqueness conflicts with existing EN row IDs.
    // Omitting items leaves the shared rows untouched; localized fields fall back to EN.
    // For links (simple array, no join tables): carry EN IDs so Payload updates in-place.
    const {
      items: _items,
      links: esLinks,
      ...blockRest
    } = block as unknown as Record<string, unknown>

    const enLinks = (enBlock?.links ?? []) as Array<Record<string, unknown>>
    const mergedLinks =
      Array.isArray(esLinks) && esLinks.length > 0
        ? (esLinks as Array<Record<string, unknown>>).map((esLink, j) => ({
            ...esLink,
            id: enLinks[j]?.id ?? (esLink as Record<string, unknown>).id,
          }))
        : undefined

    return {
      ...blockRest,
      id: blockId,
      ...(mergedLinks !== undefined ? { links: mergedLinks } : {}),
    }
  })

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
      ...(esLayout.length > 0 ? { layout: esLayout as any } : {}),
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
  })

  return doc
}

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
    // For array fields Payload's Drizzle adapter does DELETE+INSERT (not UPDATE) during locale
    // updates, causing uniqueness conflicts with existing EN row IDs.
    // Strategy: carry EN row IDs and pass only localized scalar fields per row — never
    // relationship/upload fields, which are shared across locales and would re-insert.
    const {
      items: esItems,
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

    const enItems = (enBlock?.items ?? []) as Array<Record<string, unknown>>
    const mergedItems =
      Array.isArray(esItems) && esItems.length > 0
        ? (esItems as Array<Record<string, unknown>>).map((esItem, j) => {
            const enItem = enItems[j] ?? {}
            // Omit id — passing the EN row's id causes a uniqueness conflict because
            // Drizzle does INSERT (not UPDATE) for array rows in locale updates.
            // Pass required non-localized fields (page, image) from EN so validation passes;
            // localized scalar fields (cta, label, description) come from the ES spec.
            const { id: _id, page: _esPage, image: _esImage, ...localizedFields } = esItem
            // Coerce to ID only — never pass objects, which would trigger blob re-upload.
            const pageId =
              typeof enItem.page === 'object' && enItem.page !== null
                ? (enItem.page as { id: number }).id
                : enItem.page
            const imageId =
              typeof enItem.image === 'object' && enItem.image !== null
                ? (enItem.image as { id: number }).id
                : enItem.image
            return {
              page: pageId,
              image: imageId,
              ...localizedFields,
            }
          })
        : undefined

    return {
      ...blockRest,
      id: blockId,
      ...(mergedLinks !== undefined ? { links: mergedLinks } : {}),
      ...(mergedItems !== undefined ? { items: mergedItems } : {}),
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

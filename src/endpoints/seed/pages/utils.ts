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

  const { title: esTitle, slug: esSlug, layout: _esLayoutInput, hero: esHeroInput, ...esExtra } = es

  // Re-fetch with depth:0 to get raw row UUIDs for the ES update (layout blocks + hero links).
  const rawDoc = await payload.findByID({
    collection: 'pages',
    id: doc.id,
    depth: 0,
    locale: 'en',
  })
  const enLayout = (rawDoc.layout ?? []) as PageLayoutBlock[]

  // Hero links — inject EN row IDs so Drizzle doesn't DELETE+INSERT and wipe EN locale values.
  // link.label and link.url are localized, so we carry the ES translations but stamp the EN IDs.
  const enHeroLinks = ((rawDoc.hero as Record<string, unknown>)?.links ?? []) as Array<
    Record<string, unknown>
  >
  const esHero = esHeroInput as Record<string, unknown> | undefined
  const esHeroLinks = (esHero?.links ?? []) as Array<Record<string, unknown>>
  const mergedHeroLinks =
    esHeroLinks.length > 0
      ? esHeroLinks.map((esLink, j) => ({ ...esLink, id: enHeroLinks[j]?.id ?? esLink.id }))
      : esHeroLinks
  const mergedHero = esHero !== undefined ? { ...esHero, links: mergedHeroLinks } : undefined
  const esLayout = (_esLayoutInput ?? []).map((block, i: number) => {
    const enBlock = enLayout[i] as unknown as Record<string, unknown> | undefined
    const blockId = enBlock?.id ?? (block as unknown as Record<string, unknown>).id
    // For array fields Payload's Drizzle adapter does DELETE+INSERT (not UPDATE) during locale
    // updates, causing uniqueness conflicts with existing EN row IDs.
    // Strategy: carry EN row IDs and pass only localized scalar fields per row — never
    // relationship/upload fields, which are shared across locales and would re-insert.
    const {
      items: esItems,
      links: esLinks,
      steps: esSteps,
      cta: esCta,
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
    // Whether to inject the EN row id depends on how the block's `items` array is localized:
    // - Subfield-localized (e.g. audienceShowcase: array shared, only label/description/cta
    //   localized via a separate `_locales` table) — injecting the EN id does an in-place
    //   UPDATE, preserving the EN values. Safe and necessary here.
    // - Array-level localized (e.g. cardGrid: `localized: true` on the array itself — Payload
    //   duplicates the whole row per locale in the SAME base table, sharing the `id` column
    //   without `_locale` in the key). Injecting the EN id collides with the existing EN row
    //   and throws "Value must be unique" on `id` (confirmed: seedForBrands → upsertPage).
    //   These blocks' EN/ES items are independent by design — never inject id here.
    const blockType = (block as unknown as Record<string, unknown>).blockType
    const itemsArrayIsLocalized = blockType === 'cardGrid'
    const mergedItems =
      Array.isArray(esItems) && esItems.length > 0
        ? (esItems as Array<Record<string, unknown>>).map((esItem, j) => {
            const enItem = enItems[j] ?? {}
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
              ...(itemsArrayIsLocalized ? {} : { id: enItem.id }),
              page: pageId,
              image: imageId,
              ...localizedFields,
            }
          })
        : undefined

    // steps — inject EN row IDs so Drizzle updates in-place (title, body are localized)
    const enSteps = (enBlock?.steps ?? []) as Array<Record<string, unknown>>
    const mergedSteps =
      Array.isArray(esSteps) && esSteps.length > 0
        ? (esSteps as Array<Record<string, unknown>>).map((esStep, j) => ({
            ...esStep,
            id: enSteps[j]?.id,
          }))
        : undefined

    // cta — inject EN row IDs (link.label + link.url are localized)
    const enCta = (enBlock?.cta ?? []) as Array<Record<string, unknown>>
    const mergedCta =
      Array.isArray(esCta) && esCta.length > 0
        ? (esCta as Array<Record<string, unknown>>).map((ctaItem, j) => ({
            ...ctaItem,
            id: enCta[j]?.id,
          }))
        : undefined

    return {
      ...blockRest,
      id: blockId,
      ...(mergedLinks !== undefined ? { links: mergedLinks } : {}),
      ...(mergedItems !== undefined ? { items: mergedItems } : {}),
      ...(mergedSteps !== undefined ? { steps: mergedSteps } : {}),
      ...(mergedCta !== undefined ? { cta: mergedCta } : {}),
    }
  })

  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale: 'es',
    data: {
      title: esTitle,
      slug: esSlug,
      _status: 'published' as const,
      ...esExtra,
      ...(mergedHero !== undefined ? { hero: mergedHero as Record<string, unknown> } : {}),
      // layout is not localized — only pass it when ES blocks need localized field updates.
      // Never pass layout: [] here as it would wipe the EN layout (shared across locales).
      ...(esLayout.length > 0 ? { layout: esLayout as Record<string, unknown>[] } : {}),
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
  })

  return doc
}

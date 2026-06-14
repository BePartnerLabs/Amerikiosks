import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '../../../payload-types'

const localePath = (slug: string, locale: string) => {
  const base = slug === 'home' ? '/' : `/${slug}`
  return locale === 'en' ? base : `/${locale}${base}`
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context, locale },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = localePath(doc.slug as string, (locale as string) ?? 'en')

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = localePath(previousDoc.slug as string, (locale as string) ?? 'en')

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { context, locale },
}) => {
  if (!context.disableRevalidate) {
    const path = localePath(doc?.slug as string, (locale as string) ?? 'en')
    revalidatePath(path)
    revalidateTag('pages-sitemap', 'max')
  }

  return doc
}

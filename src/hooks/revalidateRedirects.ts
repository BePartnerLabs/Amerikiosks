import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateRedirects: CollectionAfterChangeHook = ({
  context,
  doc,
  req: { payload },
}) => {
  // `revalidateTag` needs Next's request store, which only exists inside a
  // request. A migration or a one-off script runs outside one and would throw
  // "Invariant: static generation store missing", failing the whole write — so
  // those callers pass `context.disableRevalidate` and let the deploy handle
  // cache invalidation instead.
  if (context?.disableRevalidate) return doc

  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', 'max')

  return doc
}

import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    try {
      payload.logger.info('Revalidating settings')
      revalidateTag('global_settings', 'max')
      revalidatePath('/robots.txt', 'layout')
      revalidateTag('llms-txt', 'max')
    } catch (err) {
      // Next's cache primitives need a request store, which a script, a seed or
      // a queued job does not have — and there is no page cache to bust in
      // those contexts anyway. Unhandled, this aborted the whole write: a
      // script refreshing the Monday boards cache failed *after* the update had
      // been committed, so the operation reported failure on a change that had
      // actually landed. Same best-effort treatment as revalidateFormGlobals.
      payload.logger.warn(
        `Could not revalidate settings outside a request context: ${(err as Error).message}`,
      )
    }
  }

  return doc
}

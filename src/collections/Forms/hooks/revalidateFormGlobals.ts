import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

// Globals whose cached copy can embed a whole Form document (via a link field
// with type: 'modal'). Their cache entries hold that form *populated*, so a
// change to the form is invisible to them until their own tag is busted.
const GLOBALS_EMBEDDING_FORMS = ['global_header', 'global_footer'] as const

/**
 * Editing a form in /admin used to leave every modal CTA in the header and
 * footer serving the version of that form which happened to be cached when the
 * global was last saved — stale title, stale fields, missing anything added to
 * the Form config since. Nothing in Payload connects the two, because from the
 * cache's point of view the form is just part of the global's payload.
 */
export const revalidateFormGlobals: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    for (const tag of GLOBALS_EMBEDDING_FORMS) {
      try {
        payload.logger.info(`Revalidating ${tag} after a form change`)
        revalidateTag(tag, 'max')
      } catch (err) {
        // revalidateTag needs Next's request store, which a script, a seed or
        // a queued job does not have — and there is no page cache to bust in
        // that context anyway. Busting the cache is best-effort; refusing to
        // save the form because of it is not acceptable.
        payload.logger.warn(
          `Could not revalidate ${tag} outside a request context: ${(err as Error).message}`,
        )
      }
    }
  }

  return doc
}

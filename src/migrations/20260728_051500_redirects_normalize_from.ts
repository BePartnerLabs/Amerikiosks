import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { normalizePath } from '@/plugins/redirects/normalizePath'

/**
 * Existing rows were authored before `from` was normalized on save, so the
 * table holds values that never matched anything: trailing slashes
 * (`/cart/`), missing leading slashes (`our-story`), mixed casing.
 *
 * Matching normalizes on read too, so this is cosmetic — but leaving the raw
 * values in place means /admin shows the editor something different from what
 * actually matches, which is how the table drifted in the first place.
 *
 * `from` is unique: when two rows normalize to the same key (e.g.
 * `/our-history` and `/our-history/`) the collision is left untouched and
 * logged, because picking a winner is a content decision.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'redirects',
    limit: 0,
    pagination: false,
    req,
  })

  const taken = new Set(docs.map((doc) => doc.from).filter(Boolean) as string[])

  for (const doc of docs) {
    if (!doc.from) continue

    const normalized = normalizePath(doc.from).path
    if (normalized === doc.from) continue

    if (taken.has(normalized)) {
      payload.logger.warn(
        `Redirect ${doc.id}: "${doc.from}" already exists as "${normalized}" — left as-is, resolve by hand.`,
      )
      continue
    }

    await payload.update({
      collection: 'redirects',
      id: doc.id,
      data: { from: normalized },
      req,
      // No Next request store here — see revalidateRedirects.
      context: { disableRevalidate: true },
    })

    taken.delete(doc.from)
    taken.add(normalized)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The pre-normalization spelling isn't recoverable, and restoring it would
  // only bring back values that match nothing.
}

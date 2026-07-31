// Keys that describe how a Form syncs to Monday.com. They identify the client's
// board, its group and the column each answer is written to — internal CRM
// wiring that no visitor needs and that should not be published.
const INTEGRATION_KEYS = new Set(['integrationTarget', 'externalId', 'mondayGroupId'])

/**
 * Strips the Monday integration keys out of anything on its way to the browser.
 *
 * Belt to the field-level `access.read` braces in `src/plugins/index.ts`. That
 * access works on the REST API (verified: `/api/forms`, `/api/globals/footer`
 * and `/api/pages?depth=4` all come back redacted), but a Header/Footer global
 * read through the Local API at depth 1 still arrived populated — a modal CTA
 * relates to `forms`, that document is handed to a client component, and it
 * therefore lands in the RSC payload of every page. Rather than depend on
 * exactly when Payload evaluates field access through a populated relationship,
 * this deletes the keys outright at the server→client boundary.
 *
 * Safe because nothing in the render reads them: FormBlock and FormDrawer use
 * title, displayTitle, fields, labels, confirmation and consent only. The
 * submission route and the sync hook re-read the form server-side with
 * `overrideAccess` at its default, so Monday sync is untouched.
 */
export function stripFormIntegrationFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripFormIntegrationFields(entry)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(source)) {
      if (INTEGRATION_KEYS.has(key)) continue
      out[key] = stripFormIntegrationFields(entry)
    }
    return out as unknown as T
  }
  return value
}

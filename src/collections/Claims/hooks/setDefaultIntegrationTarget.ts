import type { CollectionBeforeValidateHook } from 'payload'

// Runs at creation time, before the sync hook ever dispatches — by the time
// a claim already exists, it's too late to decide where it should have
// gone. Reads Settings.defaultClaimIntegrationTarget so staff can change
// the default without a deploy; an explicitly-provided integrationTarget
// (e.g. set by staff directly in /admin) is never overridden.
export const setDefaultIntegrationTarget: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data || data.integrationTarget) return data

  const settings = await req.payload.findGlobal({ slug: 'settings', req })

  return { ...data, integrationTarget: settings.defaultClaimIntegrationTarget ?? 'jotform' }
}

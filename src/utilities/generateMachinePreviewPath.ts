import type { PayloadRequest } from 'payload'
import type { MachineFamily } from '@/payload-types'

type Props = {
  slug?: string | null
  family?: number | string | MachineFamily | null
  req: PayloadRequest
}

// Machines live at /machines/[family]/[slug] — the family slug isn't on the
// machine document itself, so it needs a lookup when `family` is just an id
// (the usual shape while editing in the admin panel).
export const generateMachinePreviewPath = async ({ slug, family, req }: Props) => {
  if (!slug || !family) return null

  const familySlug =
    typeof family === 'object'
      ? family.slug
      : (
          await req.payload.findByID({
            collection: 'machine-families',
            id: family,
            depth: 0,
            req,
          })
        ).slug

  if (!familySlug) return null

  const locale = (req.locale as string) ?? 'en'
  const localePrefix = locale === 'en' ? '' : `/${locale}`

  const encodedParams = new URLSearchParams({
    slug,
    collection: 'machines',
    path: `${localePrefix}/machines/${encodeURIComponent(familySlug)}/${encodeURIComponent(slug)}`,
  })

  return `/next/preview?${encodedParams.toString()}`
}

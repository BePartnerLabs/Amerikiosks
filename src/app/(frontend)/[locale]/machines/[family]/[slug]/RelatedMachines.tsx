import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { ModelLinesBlock } from '@/blocks/ModelLines/Component'
import type { MachineFamily } from '@/payload-types'

type Props = {
  currentFamilyId: number
  locale: 'en' | 'es'
}

// Reuses the exact home-page "explore our systems" carousel (ModelLinesBlock)
// instead of the smaller circle-thumbnail row, per feedback that this
// section should look the same as home's model lines.
export const RelatedMachines: React.FC<Props> = async ({ currentFamilyId, locale }) => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'machine-families',
    where: { id: { not_equals: currentFamilyId } },
    depth: 1,
    overrideAccess: false,
    locale,
    limit: 5,
  })

  const families = result.docs as MachineFamily[]
  if (families.length === 0) return null

  return (
    <ModelLinesBlock
      blockType="modelLines"
      eyebrow="Explore more models"
      heading="Find the right kiosk for your space."
      families={families}
      locale={locale}
    />
  )
}

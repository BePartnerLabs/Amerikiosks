import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import type { ClaimFormBlock as ClaimFormBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { ClaimFormBlock } from './Component'

export const ClaimFormServer: React.FC<ClaimFormBlockProps> = async (props) => {
  const payload = await getPayload({ config })

  const brandsResult = await payload.find({
    collection: 'brands',
    depth: 1,
    overrideAccess: false,
    // Same tiebreaker as the collection's defaultSort — see Brands.ts.
    sort: ['order', 'name'],
    limit: 100,
  })

  const brands = brandsResult.docs.map((brand) => ({
    id: brand.id,
    name: brand.name,
    logoUrl: typeof brand.logo === 'object' ? (brand.logo?.url ?? undefined) : undefined,
  }))

  // The section chrome lives here rather than in Component.tsx because the
  // client component returns from three different branches (success, intro,
  // step) — wrapping once on the server keeps the landmark and the GA
  // attributes from having to be repeated in each.
  return (
    <section
      className="ak-claim-form-block"
      aria-label={props.blockName ?? 'Refund claim'}
      data-ga-block={toSnakeCase(props.blockType)}
      data-ga-section={props.blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <ClaimFormBlock
          id={props.id ? String(props.id) : undefined}
          introContent={props.introContent ?? undefined}
          creditsAvailableYesMessage={props.creditsAvailableYesMessage ?? undefined}
          creditsAvailableNoMessage={props.creditsAvailableNoMessage ?? undefined}
          additionalInfoHint={props.additionalInfoHint ?? undefined}
          submitButtonLabel={props.submitButtonLabel ?? undefined}
          brands={brands}
        />
      </div>
    </section>
  )
}

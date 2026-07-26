import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { ModelLinesRow } from '@/components/ModelLinesRow'
import { Link } from '@/i18n/routing'
import type { MachineFamily } from '@/payload-types'

type Props = {
  currentFamilyId: number
  locale: 'en' | 'es'
}

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
    <section className="ak-machine-detail__related">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__related-inner">
          <p className="ak-machine-detail__related-eyebrow">EXPLORE MORE MODELS</p>
          <h2 className="ak-machine-detail__related-heading">
            Find the right kiosk for your space.
          </h2>
          <ModelLinesRow families={families} />
          <div className="ak-machine-detail__related-cta">
            <Link
              href="/machines"
              className="bp-btn"
            >
              View all models
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

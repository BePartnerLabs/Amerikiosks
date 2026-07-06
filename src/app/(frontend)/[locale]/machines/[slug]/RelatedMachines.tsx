import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { MachineCard } from '@/blocks/MachinesListing/MachineCard'
import type { Machine } from '@/payload-types'

type Props = {
  currentSlug: string
  locale: 'en' | 'es'
}

export const RelatedMachines: React.FC<Props> = async ({ currentSlug, locale }) => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'machines',
    where: { slug: { not_equals: currentSlug } },
    depth: 1,
    overrideAccess: false,
    locale,
    limit: 3,
  })

  const machines = result.docs as Machine[]
  if (machines.length === 0) return null

  return (
    <section className="ak-machine-detail__related">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__related-inner">
          <p className="ak-machine-detail__related-eyebrow">EXPLORE MORE MODELS</p>
          <h2 className="ak-machine-detail__related-heading">
            Find the right kiosk for your space.
          </h2>
          <div className="ak-machine-detail__related-grid">
            {machines.map((machine, i) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

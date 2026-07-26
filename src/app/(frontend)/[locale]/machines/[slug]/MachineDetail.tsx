import Image from 'next/image'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { MachineHero } from '@/components/MachineHero'
import type { Machine, Media } from '@/payload-types'
import { Capabilities } from './Capabilities'
import { Dimensions } from './Dimensions'
import { Highlights } from './Highlights'
import { RelatedMachines } from './RelatedMachines'

type Props = {
  machine: Machine
  locale: 'en' | 'es'
}

export const MachineDetail: React.FC<Props> = ({ machine, locale }) => {
  const ctaLabel = machine.cta?.label || 'Contact Sales'
  const ctaUrl = machine.cta?.url || '/contact'
  const familyId = machine.family
    ? typeof machine.family === 'object'
      ? machine.family.id
      : machine.family
    : null

  return (
    <main className="ak-machine-detail">
      <MachineHero machine={machine} />

      {machine.highlights && <Highlights highlights={machine.highlights} />}

      {machine.capabilities && (
        <Capabilities
          capabilities={machine.capabilities}
          gallery={machine.gallery}
        />
      )}

      {machine.dimensionDiagrams && machine.dimensionDiagrams.length > 0 && (
        <Dimensions
          diagrams={machine.dimensionDiagrams}
          dimensions={machine.dimensions}
        />
      )}

      {machine.gallery && machine.gallery.length > 0 && (
        <section className="ak-machine-detail__gallery">
          <div className="ak-machine-detail__gallery-strip">
            {machine.gallery.map((item, i) => {
              const image = typeof item.image === 'object' ? (item.image as Media) : null
              if (!image?.url) return null
              return (
                <div
                  key={item.id ?? i}
                  className="ak-machine-detail__gallery-item"
                >
                  <Image
                    src={image.url}
                    alt={`${machine.name} gallery image ${i + 1}`}
                    fill
                    className="ak-machine-detail__gallery-img"
                    sizes="(max-width: 640px) 90vw, 50vw"
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {familyId && (
        <RelatedMachines
          currentFamilyId={familyId}
          locale={locale}
        />
      )}

      <CallToActionBlock
        blockType="cta"
        richText={{
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h2',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Ready to place ${machine.name} in your location?`,
                  },
                ],
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        }}
        links={[
          {
            link: {
              label: ctaLabel,
              type: 'custom',
              url: ctaUrl,
              appearance: 'default',
            },
          },
        ]}
      />
    </main>
  )
}

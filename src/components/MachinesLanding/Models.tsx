'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useActiveFamily } from './Provider'

export const MachinesModels: React.FC = () => {
  const { active } = useActiveFamily()
  const t = useTranslations('machines')

  return (
    <section className="ak-models">
      <div className="bp-content-grid">
        <div className="content">
          <p className="ak-models__eyebrow">{t('theLine')}</p>
          <h2 className="ak-models__heading">{t('modelsHeading', { family: active.name })}</h2>

          <div className="ak-models__grid">
            {active.machines.length === 0 && <p className="ak-models__empty">{t('noModels')}</p>}

            {active.machines.map((machine) => (
              <Link
                key={machine.id}
                href={{
                  pathname: '/machines/[family]/[slug]',
                  params: { family: active.slug, slug: machine.slug },
                }}
                className="ak-model"
                data-ga-event="machine_model_click"
                data-ga-label={machine.name}
              >
                {machine.imageUrl && (
                  <Image
                    src={machine.imageUrl}
                    alt=""
                    aria-hidden="true"
                    width={260}
                    height={340}
                    quality={100}
                    className="ak-model__shot"
                  />
                )}
                <h3 className="ak-model__name">{machine.name}</h3>
                {machine.specs.length > 0 && (
                  <dl className="ak-model__specs">
                    {machine.specs.map((spec) => (
                      <div key={spec.label}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <span className="ak-model__go">{t('seeMachine')}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

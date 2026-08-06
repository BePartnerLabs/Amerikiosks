import Image from 'next/image'
import { Carousel } from '@/components/Carousel'
import { Link } from '@/i18n/navigation'
import type { ModelCard } from './types'
import './styles.css'

type Props = {
  eyebrow?: string | null
  heading: string
  ctaLabel?: string | null
  models: ModelCard[]
  /** Payload's block instance id — keeps the heading id unique when a page
      carries more than one of these blocks. */
  id?: string | null
  /** Resolved on the server so this stays a plain, synchronous component. */
  labels: { previous: string; next: string; go: string }
  jsonLd?: Record<string, unknown>
}

/**
 * Every model, flat, in one carousel.
 *
 * Flat rather than grouped by family: each family already has its own section
 * above this one, with its own link. Repeating the hierarchy here would say the
 * same thing twice. The family travels on each card as an eyebrow instead, so a
 * visitor scrolling ten near-identical machines still knows which line each
 * belongs to.
 */
export const MachineModelsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  ctaLabel,
  models,
  labels,
  id,
  jsonLd,
}) => {
  const headingId = `ak-model-cards-heading${id ? `-${id}` : ''}`

  return (
    <section
      className="ak-model-cards"
      data-ga-block="machineModels"
      aria-labelledby={headingId}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld built from Payload data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="bp-content-grid">
        <div className="content">
          {eyebrow && <p className="ak-model-cards__eyebrow">{eyebrow}</p>}
          <h2
            className="ak-model-cards__heading"
            id={headingId}
          >
            {heading}
          </h2>

          <Carousel
            panelSelector=".ak-model-card"
            className="ak-model-cards__carousel"
            trackClassName="ak-model-cards__track"
            navClassName="ak-model-cards__carousel-nav"
            buttonClassName="ak-model-cards__carousel-btn"
            trackAs="ul"
            labels={{ previous: labels.previous, next: labels.next }}
            trackLabel={heading}
          >
            {models.map((model) => (
              <li
                className="ak-model-cards__item"
                key={model.id}
              >
                <Link
                  href={{
                    pathname: '/machines/[family]/[slug]',
                    params: { family: model.familySlug as string, slug: model.slug },
                  }}
                  className="ak-model-card"
                  data-ga-event="machine_model_click"
                  data-ga-label={model.name}
                >
                  {model.imageUrl && (
                    <Image
                      src={model.imageUrl}
                      alt=""
                      aria-hidden="true"
                      width={260}
                      height={340}
                      quality={100}
                      className="ak-model-card__shot"
                    />
                  )}
                  {model.familyName && <p className="ak-model-card__family">{model.familyName}</p>}
                  <h3 className="ak-model-card__name">{model.name}</h3>
                  {model.specs.length > 0 && (
                    <dl className="ak-model-card__specs">
                      {model.specs.map((spec) => (
                        <div key={spec.label}>
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <span className="ak-model-card__go">{ctaLabel ?? labels.go}</span>
                </Link>
              </li>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

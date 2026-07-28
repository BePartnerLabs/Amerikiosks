import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { FormDrawerTrigger } from '@/components/FormDrawer'
import { SectionHeader } from '@/components/SectionHeader'
import type {
  AudienceShowcaseBlock as AudienceShowcaseBlockProps,
  Form,
  Media,
  Page,
} from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type PopulatedItem = NonNullable<AudienceShowcaseBlockProps['items']>[number] & {
  page?: Page | null
  form?: Form | null
  image: Media
}

export const AudienceShowcaseBlock: React.FC<AudienceShowcaseBlockProps> = ({
  eyebrow,
  heading,
  subheading,
  items,
  blockName,
  blockType,
}) => {
  if (!heading) return null

  const populatedItems = (items ?? []).filter((item): item is PopulatedItem => {
    if (item.image === null || typeof item.image !== 'object') return false
    return item.target === 'form'
      ? item.form !== null && typeof item.form === 'object'
      : item.page !== null && typeof item.page === 'object'
  })

  return (
    <section
      className="ak-audience-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-audience-showcase__inner">
          <div className="ak-audience-showcase__header">
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              subtitle={subheading}
              align="center"
            />
          </div>

          {populatedItems.length > 0 && (
            <div className="ak-audience-showcase__grid">
              {populatedItems.map((item) => {
                const isForm = item.target === 'form' && item.form
                const title = item.label ?? (isForm ? item.form?.title : item.page?.title) ?? ''
                const description = item.description ?? item.page?.meta?.description

                const inner = (
                  <>
                    <div className="ak-audience-showcase__card-photo">
                      <Image
                        src={getBestMediaUrl(item.image, 600) ?? item.image.url ?? ''}
                        alt={item.image.alt ?? title}
                        fill
                        className="ak-audience-showcase__card-img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="ak-audience-showcase__card-label-row">
                      <span className="ak-audience-showcase__card-label">{title}</span>
                    </div>
                    <div className="ak-audience-showcase__card-body">
                      {description && (
                        <p className="ak-audience-showcase__card-description">{description}</p>
                      )}
                      {item.cta && (
                        <span className="ak-audience-showcase__card-cta bp-btn bp-btn--ghost">
                          {item.cta}
                        </span>
                      )}
                    </div>
                  </>
                )

                if (isForm && item.form) {
                  return (
                    <FormDrawerTrigger
                      key={item.id ?? `form-${item.form.id}`}
                      form={item.form}
                      className="ak-audience-showcase__card"
                      data-ga-event="audience_card_click"
                      data-ga-label={title}
                    >
                      {inner}
                    </FormDrawerTrigger>
                  )
                }

                if (!item.page) return null

                return (
                  <Link
                    key={item.id ?? item.page.id}
                    href={`/${item.page.slug}`}
                    className="ak-audience-showcase__card"
                    data-ga-event="audience_card_click"
                    data-ga-label={item.page.title}
                  >
                    {inner}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { FormBlock } from '@/blocks/Form/Component'
import RichText from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import type { FAQWithFormBlock as FAQWithFormBlockProps, FaqItem } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type Props = FAQWithFormBlockProps & { resolvedFaqs?: FaqItem[]; resolvedForm?: FormType | null }

export const FAQWithFormBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  resolvedFaqs = [],
  resolvedForm,
}) => {
  if (!heading) return null

  return (
    <section
      className="ak-faq-form"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-faq-form__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={heading}
            subtitle={subheading}
            align="center"
          />

          <div className="ak-faq-form__columns">
            <div className="ak-faq-form__faq-side">
              {resolvedFaqs.length > 0 && (
                <div className="bp-accordion">
                  {resolvedFaqs.map((item) => (
                    <details
                      key={item.id}
                      className="bp-accordion__item"
                      name={`faq-${blockName ?? 'block'}`}
                    >
                      <summary
                        className="bp-accordion__summary"
                        data-ga-event="faq_expand"
                        data-ga-label={item.question}
                      >
                        {item.question}
                      </summary>
                      <div className="bp-accordion__body">
                        {item.answer && (
                          <RichText data={item.answer as Parameters<typeof RichText>[0]['data']} />
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>

            <div className="ak-faq-form__form-side">
              {resolvedForm && (
                <FormBlock
                  form={resolvedForm}
                  enableIntro={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

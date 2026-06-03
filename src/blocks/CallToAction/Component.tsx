import type React from 'react'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

export const CallToActionBlock: React.FC<CTABlockProps> = ({
  links,
  richText,
  blockName,
  blockType,
}) => {
  return (
    <section
      className="ak-cta"
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-cta__inner">
          {richText && (
            <div className="ak-cta__text">
              <RichText
                data={richText}
                enableGutter={false}
              />
            </div>
          )}
          {(links || []).length > 0 && (
            <div className="ak-cta__actions">
              {(links || []).map(({ link }) => (
                <CMSLink
                  key={`${link.type}-${link.url}-${link.label}`}
                  size="lg"
                  {...link}
                  data-ga-event="cta_click"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

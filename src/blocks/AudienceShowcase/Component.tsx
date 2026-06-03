import type React from 'react'
import type { AudienceShowcaseBlock as AudienceShowcaseBlockProps } from '@/payload-types'

export const AudienceShowcaseBlock: React.FC<AudienceShowcaseBlockProps> = ({
  eyebrow,
  heading,
  subheading,
  items,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  return (
    <section aria-label={heading || 'Audience showcase'}>
      {eyebrow && <div>{eyebrow}</div>}
      {heading && <h2>{heading}</h2>}
      {subheading && <p>{subheading}</p>}
      {items && items.length > 0 && (
        <div>
          {items.map((item, index) => (
            <div key={item.id || index}>
              <span>
                {item.label || (typeof item.page === 'object' ? item.page?.title : 'Item')}
              </span>
              {item.cta && <span>{item.cta}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

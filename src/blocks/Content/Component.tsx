import type React from 'react'
import RichText from '@/components/RichText'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { CMSLink } from '../../components/Link'
import './styles.css'

const colSizeClass: Record<string, string> = {
  full: 'ak-content__col--full',
  half: 'ak-content__col--half',
  oneThird: 'ak-content__col--oneThird',
  twoThirds: 'ak-content__col--twoThirds',
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, blockName, blockType } = props

  return (
    <section
      className="ak-content"
      aria-label={blockName ?? undefined}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="ak-content__columns">
          {columns &&
            columns.length > 0 &&
            columns.map((col) => {
              const { enableLink, link, richText, size } = col
              const columnKey =
                col.id ?? `${size ?? 'col'}-${link?.url ?? link?.label ?? 'content-column'}`

              return (
                <div
                  className={`ak-content__col ${colSizeClass[size ?? 'full'] ?? ''}`}
                  key={columnKey}
                >
                  {richText && (
                    <RichText
                      data={richText}
                      enableGutter={false}
                    />
                  )}
                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}

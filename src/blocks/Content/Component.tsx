import type React from 'react'
import RichText from '@/components/RichText'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { CMSLink } from '../../components/Link'
import './styles.css'

const colSizeClass: Record<string, string> = {
  full: 'ak-content__col--full',
  half: 'ak-content__col--half',
  oneThird: 'ak-content__col--oneThird',
  twoThirds: 'ak-content__col--twoThirds',
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  return (
    <div className="ak-content">
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
    </div>
  )
}

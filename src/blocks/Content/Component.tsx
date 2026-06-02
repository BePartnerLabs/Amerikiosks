import type React from 'react'
import RichText from '@/components/RichText'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const _colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="">
      <div className="">
        {columns &&
          columns.length > 0 &&
          columns.map((col) => {
            const { enableLink, link, richText, size: _size } = col
            const columnKey =
              col.id ?? `${_size ?? 'col'}-${link?.url ?? link?.label ?? 'content-column'}`

            return (
              <div
                className=""
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
  )
}

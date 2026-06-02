import type React from 'react'

import { Card, type CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className="">
      <div>
        <div className="">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div
                  className=""
                  key={String(index)}
                >
                  <Card
                    className=""
                    doc={result}
                    relationTo="posts"
                    showCategories
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}

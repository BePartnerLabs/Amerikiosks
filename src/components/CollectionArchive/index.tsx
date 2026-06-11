import type React from 'react'
import { Card, type CardPostData } from '@/components/Card'
import './styles.css'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = ({ posts }) => {
  if (!posts?.length) return null

  const [featured, ...rest] = posts

  return (
    <div className="ak-collection-archive">
      {featured && (
        <div className="ak-collection-archive__featured">
          <Card
            doc={featured}
            relationTo="insights"
            featured
          />
        </div>
      )}
      {rest.length > 0 && (
        <div className="ak-collection-archive__grid">
          {rest.map((post, index) => (
            <Card
              key={String(index)}
              doc={post}
              relationTo="insights"
            />
          ))}
        </div>
      )}
    </div>
  )
}

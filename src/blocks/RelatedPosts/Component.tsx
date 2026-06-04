import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { Card } from '../../components/Card'
import './styles.css'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ docs, introContent }) => {
  return (
    <div className="ak-related-posts">
      {introContent && (
        <div className="ak-related-posts__intro">
          <RichText
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <div className="ak-related-posts__grid">
        {docs?.map((doc) => {
          if (typeof doc === 'string') return null
          return (
            <Card
              key={doc.id}
              doc={doc}
              relationTo="posts"
              showCategories
            />
          )
        })}
      </div>
    </div>
  )
}

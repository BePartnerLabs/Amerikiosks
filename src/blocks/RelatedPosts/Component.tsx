import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { Card } from '../../components/Card'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className: _className, docs, introContent } = props

  return (
    <div className="">
      {introContent && (
        <RichText
          data={introContent}
          enableGutter={false}
        />
      )}

      <div className="">
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

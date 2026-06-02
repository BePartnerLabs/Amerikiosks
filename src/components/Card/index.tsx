'use client'
import Link from 'next/link'
import type React from 'react'
import { Fragment } from 'react'
import { Media } from '@/components/Media'

import type { Post } from '@/payload-types'
import useClickableCard from '@/utilities/useClickableCard'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className=""
      ref={card.ref}
    >
      <div className="">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            size="33vw"
          />
        )}
      </div>
      <div className="">
        {showCategories && hasCategories && (
          <div className="">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'
                const categoryKey =
                  'id' in category && category.id
                    ? String(category.id)
                    : `${slug || 'post'}-${categoryTitle}`

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={categoryKey}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <div className="">
            <h3>
              <Link
                className=""
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}

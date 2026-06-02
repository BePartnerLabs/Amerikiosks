import React from 'react'
import { formatDateTime } from 'src/utilities/formatDateTime'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'
                const categoryKey =
                  'id' in category &&
                  (typeof category.id === 'string' || typeof category.id === 'number')
                    ? category.id
                    : titleToUse

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={categoryKey}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="">{title}</h1>
          </div>

          <div className="">
            {hasAuthors && (
              <div className="">
                <div className="">
                  <p className="">Author</p>

                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              </div>
            )}
            {publishedAt && (
              <div className="">
                <p className="">Date Published</p>

                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="">
        {heroImage && typeof heroImage !== 'string' && (
          <Media
            fill
            priority
            imgClassName=""
            resource={heroImage}
          />
        )}
        <div className="" />
      </div>
    </div>
  )
}

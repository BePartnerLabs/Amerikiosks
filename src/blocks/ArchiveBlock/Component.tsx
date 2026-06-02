import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { CollectionArchive } from '@/components/CollectionArchive'
import RichText from '@/components/RichText'
import type { ArchiveBlock as ArchiveBlockProps, Post } from '@/payload-types'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs
        .filter((post) => typeof post.value === 'object')
        .map((post) => post.value as Post)

      posts = filteredSelectedPosts
    }
  }

  return (
    <div
      className=""
      id={`block-${id}`}
    >
      {introContent && (
        <div className="">
          <RichText
            className=""
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}

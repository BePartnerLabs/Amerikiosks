import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { CollectionArchive } from '@/components/CollectionArchive'
import RichText from '@/components/RichText'
import type { ArchiveBlock as ArchiveBlockProps, Post } from '@/payload-types'
import './styles.css'

export const ArchiveBlock: React.FC<ArchiveBlockProps & { id?: string }> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    blockName,
    blockType,
  } = props

  const limit = limitFromProps || 4

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
        ? { where: { categories: { in: flattenedCategories } } }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      posts = selectedDocs
        .filter((post) => typeof post.value === 'object')
        .map((post) => post.value as Post)
    }
  }

  return (
    <section
      className="ak-archive"
      id={`block-${id}`}
      data-ga-block="archive"
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-archive__inner">
          {introContent && (
            <div className="ak-archive__header">
              <RichText
                data={introContent}
                enableGutter={false}
              />
            </div>
          )}
          <CollectionArchive posts={posts} />
        </div>
      </div>
    </section>
  )
}

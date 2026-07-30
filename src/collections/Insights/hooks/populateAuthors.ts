import type { CollectionAfterReadHook } from 'payload'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const ids = doc.authors
      .map((author: { id?: number } | number) => (typeof author === 'object' ? author?.id : author))
      .filter(Boolean)

    try {
      const { docs } = await req.payload.find({
        collection: 'users',
        depth: 0,
        limit: ids.length,
        pagination: false,
        req,
        where: { id: { in: ids } },
      })

      if (docs.length > 0) {
        doc.populatedAuthors = docs.map((authorDoc) => ({
          id: authorDoc.id,
          name: authorDoc.name,
        }))
      }
    } catch {
      // swallow error — an unpopulated author list must not break reads
    }
  }

  return doc
}

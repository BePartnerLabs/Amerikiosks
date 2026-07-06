import { describe, expect, it } from 'vitest'
import { searchFields } from '@/search/fieldOverrides'

describe('searchFields', () => {
  it('includes a readOnly indexed slug field', () => {
    const slug = searchFields.find((f) => 'name' in f && f.name === 'slug')
    expect(slug).toBeDefined()
  })

  it('includes a meta group with title, description, and image fields', () => {
    const meta = searchFields.find((f) => 'name' in f && f.name === 'meta') as {
      fields: { name?: string }[]
    }
    expect(meta.fields.map((f) => f.name)).toEqual(['title', 'description', 'image'])
  })

  it('includes a categories array field', () => {
    const categories = searchFields.find((f) => 'name' in f && f.name === 'categories')
    expect(categories).toBeDefined()
  })
})

import type { GroupField } from 'payload'
import { describe, expect, it } from 'vitest'
import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'

describe('link field', () => {
  it('includes a label field by default', () => {
    const field = link() as GroupField
    const rowWithLabel = field.fields.find(
      (f) => f.type === 'row' && f.fields.some((sub) => 'name' in sub && sub.name === 'label'),
    )
    expect(rowWithLabel).toBeDefined()
  })

  it('omits the label field when disableLabel is true', () => {
    const field = link({ disableLabel: true }) as GroupField
    const hasLabel = field.fields.some((f) => 'name' in f && f.name === 'label')
    expect(hasLabel).toBe(false)
  })

  it('includes an appearance select by default', () => {
    const field = link() as GroupField
    const hasAppearance = field.fields.some((f) => 'name' in f && f.name === 'appearance')
    expect(hasAppearance).toBe(true)
  })

  it('omits the appearance select when appearances is false', () => {
    const field = link({ appearances: false }) as GroupField
    const hasAppearance = field.fields.some((f) => 'name' in f && f.name === 'appearance')
    expect(hasAppearance).toBe(false)
  })

  it('restricts appearance options to the ones provided', () => {
    const field = link({ appearances: ['ghost'] }) as GroupField
    const appearanceField = field.fields.find((f) => 'name' in f && f.name === 'appearance') as
      | { options: { value: string }[] }
      | undefined
    expect(appearanceField?.options).toEqual([{ label: 'Ghost (text link)', value: 'ghost' }])
  })

  it('merges overrides into the generated field', () => {
    const field = link({ overrides: { label: 'Custom Label' } }) as GroupField & {
      label?: string
    }
    expect(field.label).toBe('Custom Label')
  })
})

describe('linkGroup field', () => {
  it('produces an array field named "links" wrapping a single link field', () => {
    const field = linkGroup() as { name?: string; type?: string }
    expect(field.name).toBe('links')
    expect(field.type).toBe('array')
  })

  it('merges overrides into the generated array field', () => {
    const field = linkGroup({ overrides: { maxRows: 2 } }) as { maxRows?: number }
    expect(field.maxRows).toBe(2)
  })
})

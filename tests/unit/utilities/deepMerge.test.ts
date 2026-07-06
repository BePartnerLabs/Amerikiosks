import { describe, expect, it } from 'vitest'
import deepMerge, { isObject } from '@/utilities/deepMerge'

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns false for arrays', () => {
    expect(isObject([1, 2, 3])).toBe(false)
  })

  it('returns false for non-null primitives', () => {
    expect(isObject('string')).toBe(false)
    expect(isObject(42)).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })

  it('returns true for null (typeof null === "object" in JS)', () => {
    expect(isObject(null)).toBe(true)
  })
})

describe('deepMerge', () => {
  it('merges top-level keys from source into target', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('recursively merges nested objects', () => {
    const result = deepMerge({ nested: { a: 1, b: 2 } }, { nested: { b: 3, c: 4 } })
    expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } })
  })

  it('adds keys from source that are not present in target', () => {
    const result = deepMerge({ a: 1 }, { nested: { x: 1 } })
    expect(result).toEqual({ a: 1, nested: { x: 1 } })
  })

  it('overwrites non-object values with source values', () => {
    const result = deepMerge({ a: 1 }, { a: 'overwritten' })
    expect(result).toEqual({ a: 'overwritten' })
  })

  it('returns a shallow copy of target when source is a primitive (not an object)', () => {
    const target = { a: 1 }
    const result = deepMerge(target, 'not an object' as unknown as Record<string, never>)
    expect(result).toEqual({ a: 1 })
    expect(result).not.toBe(target)
  })
})

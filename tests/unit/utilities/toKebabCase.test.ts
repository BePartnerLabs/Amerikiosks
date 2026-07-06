import { describe, expect, it } from 'vitest'
import { toKebabCase } from '@/utilities/toKebabCase'

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world')
  })

  it('converts space-separated words to kebab-case', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
  })

  it('lowercases the result', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world')
  })

  it('collapses multiple spaces into a single dash', () => {
    expect(toKebabCase('hello   world')).toBe('hello-world')
  })
})

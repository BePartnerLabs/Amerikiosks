import { describe, expect, it } from 'vitest'
import { formatDateTime } from '@/utilities/formatDateTime'

describe('formatDateTime', () => {
  it('formats a timestamp as MM/DD/YYYY', () => {
    expect(formatDateTime('2026-03-05T12:00:00')).toBe('03/05/2026')
  })

  it('pads single-digit months and days with a leading zero', () => {
    expect(formatDateTime('2026-01-09T12:00:00')).toBe('01/09/2026')
  })

  it('does not pad double-digit months and days', () => {
    expect(formatDateTime('2026-12-25T12:00:00')).toBe('12/25/2026')
  })

  it('falls back to the current date when timestamp is empty', () => {
    const now = new Date()
    const expectedYear = String(now.getFullYear())
    expect(formatDateTime('')).toContain(expectedYear)
  })
})

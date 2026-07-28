import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useA11yPrefs } from '@/components/AccessibilityWidget/useA11yPrefs'
import { A11Y_STORAGE_KEY, DEFAULT_A11Y_PREFS } from '@/utilities/a11yPrefs'

describe('useA11yPrefs', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
  })

  it('starts at defaults and reports hydration after mount', () => {
    const { result } = renderHook(() => useA11yPrefs())
    expect(result.current.prefs).toEqual(DEFAULT_A11Y_PREFS)
    expect(result.current.hydrated).toBe(true)
  })

  it('hydrates from localStorage', () => {
    window.localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({
        textScale: 1.15,
        contrast: true,
        highlightLinks: false,
        reduceMotion: false,
      }),
    )
    const { result } = renderHook(() => useA11yPrefs())
    expect(result.current.prefs.textScale).toBe(1.15)
    expect(result.current.prefs.contrast).toBe(true)
  })

  it('setPref updates state, <html>, and localStorage', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('contrast', true)
    })
    expect(result.current.prefs.contrast).toBe(true)
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
    expect(JSON.parse(window.localStorage.getItem(A11Y_STORAGE_KEY) ?? '{}').contrast).toBe(true)
  })

  it('setPref updates the text scale custom property', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('textScale', 1.3)
    })
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
  })

  it('reset returns everything to defaults and clears the attributes', () => {
    const { result } = renderHook(() => useA11yPrefs())
    act(() => {
      result.current.setPref('contrast', true)
      result.current.setPref('reduceMotion', true)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.prefs).toEqual(DEFAULT_A11Y_PREFS)
    expect(document.documentElement.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(document.documentElement.hasAttribute('data-a11y-motion')).toBe(false)
  })
})

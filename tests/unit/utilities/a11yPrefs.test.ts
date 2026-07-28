import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  A11Y_RESTORE_SCRIPT,
  A11Y_STORAGE_KEY,
  applyA11yPrefs,
  DEFAULT_A11Y_PREFS,
  parseA11yPrefs,
  readStoredA11yPrefs,
  serializeA11yPrefs,
  storeA11yPrefs,
} from '@/utilities/a11yPrefs'

describe('parseA11yPrefs', () => {
  it('returns defaults for null, empty, or malformed input', () => {
    expect(parseA11yPrefs(null)).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('not json')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('[1,2,3]')).toEqual(DEFAULT_A11Y_PREFS)
    expect(parseA11yPrefs('null')).toEqual(DEFAULT_A11Y_PREFS)
  })

  it('reads valid stored prefs', () => {
    const raw = JSON.stringify({
      textScale: 1.3,
      contrast: true,
      highlightLinks: false,
      reduceMotion: true,
    })
    expect(parseA11yPrefs(raw)).toEqual({
      textScale: 1.3,
      contrast: true,
      highlightLinks: false,
      reduceMotion: true,
    })
  })

  it('falls back per-field when individual fields are wrong types or out of range', () => {
    const raw = JSON.stringify({
      textScale: 99,
      contrast: 'yes',
      highlightLinks: true,
      reduceMotion: null,
    })
    expect(parseA11yPrefs(raw)).toEqual({
      textScale: 1,
      contrast: false,
      highlightLinks: true,
      reduceMotion: false,
    })
  })
})

describe('serializeA11yPrefs', () => {
  it('round-trips through parse', () => {
    const prefs = {
      textScale: 1.15 as const,
      contrast: true,
      highlightLinks: true,
      reduceMotion: false,
    }
    expect(parseA11yPrefs(serializeA11yPrefs(prefs))).toEqual(prefs)
  })
})

describe('applyA11yPrefs', () => {
  it('sets the text scale property and no attributes when everything is off', () => {
    const el = document.createElement('html')
    applyA11yPrefs(DEFAULT_A11Y_PREFS, el)
    expect(el.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1')
    expect(el.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(el.hasAttribute('data-a11y-links')).toBe(false)
    expect(el.hasAttribute('data-a11y-motion')).toBe(false)
  })

  it('sets every attribute when everything is on', () => {
    const el = document.createElement('html')
    applyA11yPrefs({ textScale: 1.3, contrast: true, highlightLinks: true, reduceMotion: true }, el)
    expect(el.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
    expect(el.getAttribute('data-a11y-contrast')).toBe('on')
    expect(el.getAttribute('data-a11y-links')).toBe('on')
    expect(el.getAttribute('data-a11y-motion')).toBe('reduce')
  })

  it('removes attributes when a pref is turned back off', () => {
    const el = document.createElement('html')
    applyA11yPrefs({ textScale: 1.3, contrast: true, highlightLinks: true, reduceMotion: true }, el)
    applyA11yPrefs(DEFAULT_A11Y_PREFS, el)
    expect(el.hasAttribute('data-a11y-contrast')).toBe(false)
    expect(el.hasAttribute('data-a11y-links')).toBe(false)
    expect(el.hasAttribute('data-a11y-motion')).toBe(false)
  })
})

describe('storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('stores and reads back prefs', () => {
    const prefs = {
      textScale: 1.15 as const,
      contrast: false,
      highlightLinks: true,
      reduceMotion: false,
    }
    storeA11yPrefs(prefs)
    expect(readStoredA11yPrefs()).toEqual(prefs)
  })

  it('returns defaults and does not throw when localStorage reads throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredA11yPrefs()).toEqual(DEFAULT_A11Y_PREFS)
  })

  it('does not throw when localStorage writes throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => storeA11yPrefs(DEFAULT_A11Y_PREFS)).not.toThrow()
  })
})

describe('A11Y_RESTORE_SCRIPT', () => {
  beforeEach(() => {
    // The storage-helper suite above stubs Storage.prototype; without this the
    // throwing setItem leaks into these tests and they fail on the setup line.
    vi.restoreAllMocks()
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
  })

  it('applies stored prefs to <html> when evaluated', () => {
    window.localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({
        textScale: 1.3,
        contrast: true,
        highlightLinks: false,
        reduceMotion: true,
      }),
    )
    // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as the browser would
    eval(A11Y_RESTORE_SCRIPT)
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
    expect(document.documentElement.hasAttribute('data-a11y-links')).toBe(false)
    expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('reduce')
  })

  it('does nothing and does not throw when storage holds garbage', () => {
    window.localStorage.setItem(A11Y_STORAGE_KEY, 'garbage{')
    expect(() => {
      // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as the browser would
      eval(A11Y_RESTORE_SCRIPT)
    }).not.toThrow()
    expect(document.documentElement.hasAttribute('data-a11y-contrast')).toBe(false)
  })

  it('contains no closing script tag that would break the inline tag', () => {
    expect(A11Y_RESTORE_SCRIPT.includes('</script')).toBe(false)
  })
})

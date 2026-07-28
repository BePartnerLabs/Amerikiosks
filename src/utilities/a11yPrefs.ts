export const A11Y_STORAGE_KEY = 'ak-a11y-prefs'

/** The three text-size steps offered in the panel. */
export const TEXT_SCALES = [1, 1.15, 1.3] as const
export type TextScale = (typeof TEXT_SCALES)[number]

export type A11yPrefs = {
  textScale: TextScale
  contrast: boolean
  highlightLinks: boolean
  reduceMotion: boolean
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  textScale: 1,
  contrast: false,
  highlightLinks: false,
  reduceMotion: false,
}

function isTextScale(value: unknown): value is TextScale {
  return TEXT_SCALES.some((scale) => scale === value)
}

function bool(value: unknown): boolean {
  return value === true
}

export function parseA11yPrefs(raw: string | null | undefined): A11yPrefs {
  if (!raw) return { ...DEFAULT_A11Y_PREFS }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ...DEFAULT_A11Y_PREFS }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...DEFAULT_A11Y_PREFS }
  }

  const candidate = parsed as Record<string, unknown>

  // Per-field fallback rather than all-or-nothing: a single bad field from an
  // older schema shouldn't silently reset every other preference the user set.
  return {
    textScale: isTextScale(candidate.textScale)
      ? candidate.textScale
      : DEFAULT_A11Y_PREFS.textScale,
    contrast: bool(candidate.contrast),
    highlightLinks: bool(candidate.highlightLinks),
    reduceMotion: bool(candidate.reduceMotion),
  }
}

export function serializeA11yPrefs(prefs: A11yPrefs): string {
  return JSON.stringify(prefs)
}

function toggleAttribute(el: HTMLElement, name: string, value: string | null): void {
  if (value === null) el.removeAttribute(name)
  else el.setAttribute(name, value)
}

export function applyA11yPrefs(prefs: A11yPrefs, el: HTMLElement): void {
  el.style.setProperty('--ak-a11y-text-scale', String(prefs.textScale))
  toggleAttribute(el, 'data-a11y-contrast', prefs.contrast ? 'on' : null)
  toggleAttribute(el, 'data-a11y-links', prefs.highlightLinks ? 'on' : null)
  toggleAttribute(el, 'data-a11y-motion', prefs.reduceMotion ? 'reduce' : null)
}

export function readStoredA11yPrefs(): A11yPrefs {
  // Private browsing and storage-blocking extensions make localStorage access
  // throw rather than return null, so this cannot be a plain read.
  try {
    return parseA11yPrefs(window.localStorage.getItem(A11Y_STORAGE_KEY))
  } catch {
    return { ...DEFAULT_A11Y_PREFS }
  }
}

export function storeA11yPrefs(prefs: A11yPrefs): void {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, serializeA11yPrefs(prefs))
  } catch {
    // Persistence is best-effort; the prefs still apply for this session.
  }
}

/**
 * Runs in <head> before first paint so stored preferences don't visibly flash
 * off on every navigation. Kept here, beside parseA11yPrefs, so the two
 * can't drift apart — the unit test evaluates this string directly.
 */
export const A11Y_RESTORE_SCRIPT = `(function(){try{var r=document.documentElement;var s=window.localStorage.getItem('${A11Y_STORAGE_KEY}');if(!s)return;var p=JSON.parse(s);if(p&&typeof p==='object'){if(p.textScale===1.15||p.textScale===1.3){r.style.setProperty('--ak-a11y-text-scale',String(p.textScale))}if(p.contrast===true){r.setAttribute('data-a11y-contrast','on')}if(p.highlightLinks===true){r.setAttribute('data-a11y-links','on')}if(p.reduceMotion===true){r.setAttribute('data-a11y-motion','reduce')}}}catch(e){}})()`

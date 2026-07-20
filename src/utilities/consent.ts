export const CONSENT_COOKIE_NAME = 'ak_consent'
export const CONSENT_COOKIE_MAX_AGE = 31536000 // 1 year, in seconds

export type ConsentPreferences = {
  analytics: boolean
  timestamp: string
}

export function parseConsentCookie(raw: string | undefined): ConsentPreferences | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(decodeURIComponent(raw))
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null

  const candidate = parsed as Record<string, unknown>
  if (typeof candidate.analytics !== 'boolean') return null
  if (typeof candidate.timestamp !== 'string') return null

  return { analytics: candidate.analytics, timestamp: candidate.timestamp }
}

export function serializeConsentCookie(analytics: boolean): string {
  const preferences: ConsentPreferences = { analytics, timestamp: new Date().toISOString() }
  return JSON.stringify(preferences)
}

// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Jest-DOM matchers (toBeInTheDocument, toHaveAttribute, etc.)
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// next-intl, resolved against the real es.json.
//
// Global rather than per-file because shared components pull translations in:
// SocialLinks alone renders in the footer, the header and the mobile menu, so
// adding a `useTranslations` call there broke four unrelated Header suites that
// had no reason to know about i18n. A file that wants different behaviour can
// still `vi.mock('next-intl', …)` itself — a local mock wins.
//
// It resolves real strings instead of echoing the key back, so a test asserting
// on Spanish copy fails when the translation is missing, rather than passing on
// "footer.contact". Any file may override this by mocking next-intl itself.
vi.mock('next-intl', async () => {
  const messages = (await import('./src/messages/es.json')).default as unknown as Record<
    string,
    Record<string, string>
  >
  return {
    useTranslations: (namespace: string) => (key: string, values?: Record<string, string>) => {
      let value = messages[namespace]?.[key] ?? `${namespace}.${key}`
      for (const [name, replacement] of Object.entries(values ?? {})) {
        value = value.replace(`{${name}}`, replacement)
      }
      return value
    },
  }
})

// IntersectionObserver is not available in jsdom
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver

// window.matchMedia is not available in jsdom
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// scrollIntoView is not implemented in jsdom — the form confirmation state
// scrolls itself into view when it takes focus.
Element.prototype.scrollIntoView = () => {}

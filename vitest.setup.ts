// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Jest-DOM matchers (toBeInTheDocument, toHaveAttribute, etc.)
import '@testing-library/jest-dom/vitest'

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

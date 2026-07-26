import type { CSSProperties } from 'react'

// Cross-document view transitions are enabled globally via `@view-transition { navigation: auto }`
// in frontend.css. Giving matching elements the same view-transition-name on two different pages
// makes the browser morph between them on navigation — no JS required. Browsers without support
// (Safari, Firefox) just ignore the property and navigate normally.
export function vtName(prefix: string, slug?: string | null): CSSProperties | undefined {
  if (!slug) return undefined
  return { viewTransitionName: `${prefix}-${slug}` } as CSSProperties
}

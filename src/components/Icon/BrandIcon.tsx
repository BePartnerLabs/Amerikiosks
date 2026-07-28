import type React from 'react'
import { brandIconPaths } from './brandIcons'

type Props = {
  name: string
  className?: string
  size?: number
} & React.SVGAttributes<SVGSVGElement>

/**
 * Renders a brand logo (Instagram, LinkedIn…) as an inline SVG. Separate from
 * `Icon` because Simple Icons ship on a 0 0 24 24 viewBox while our Material
 * Symbols use 0 -960 960 960.
 *
 * `name` stays a free-text string like `Icon`'s: it comes from CMS content, so
 * an unknown platform renders nothing instead of crashing.
 */
export const BrandIcon: React.FC<Props> = ({ name, className, size = 20, ...rest }) => {
  const d = (brandIconPaths as Record<string, string>)[name]
  if (!d) return null

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  )
}

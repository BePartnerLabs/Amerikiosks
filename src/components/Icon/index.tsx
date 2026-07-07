import type React from 'react'
import { iconPaths } from './icons'

type Props = {
  name: string
  className?: string
  size?: number
} & React.SVGAttributes<SVGSVGElement>

/**
 * Renders one of our curated Material Symbols (outlined, weight 400) icons as
 * an inline SVG. Unlike the font, this ships zero bytes for icons we don't
 * use and never risks a FOUT that shows the literal icon name as text.
 *
 * `name` stays a free-text string (not `IconName`) because it's driven by CMS
 * content that predates this curated set — an unknown name renders nothing
 * instead of crashing.
 */
export const Icon: React.FC<Props> = ({ name, className, size = 24, ...rest }) => {
  const d = (iconPaths as Record<string, string>)[name]
  if (!d) return null

  return (
    <svg
      viewBox="0 -960 960 960"
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

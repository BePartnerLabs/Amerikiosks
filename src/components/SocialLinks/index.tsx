import type React from 'react'
import { BrandIcon } from '@/components/Icon/BrandIcon'
import type { Setting } from '@/payload-types'
import './styles.css'

export type SocialLink = NonNullable<Setting['socialLinks']>[number]

type Props = {
  links?: SocialLink[] | null
  variant: 'footer' | 'header' | 'mobile'
  className?: string
}

const PLATFORM_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  whatsapp: 'WhatsApp',
}

/**
 * Brand profile links, rendered identically in the footer, the header and the
 * mobile menu. `variant` only picks the root class — each zone owns its own
 * sizing and colour, so there is a single markup/a11y/analytics implementation.
 */
export const SocialLinks: React.FC<Props> = ({ links, variant, className }) => {
  const items = (links ?? []).filter((link) => link.platform && link.url)
  if (items.length === 0) return null

  return (
    <ul className={`ak-social ak-social--${variant}${className ? ` ${className}` : ''}`}>
      {items.map((link, i) => (
        <li key={link.id ?? i}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ak-social__link"
            aria-label={link.label ?? `Amerikiosks on ${PLATFORM_NAMES[link.platform] ?? ''}`}
            data-ga-event="social_link_click"
            data-ga-section={variant}
            data-ga-label={link.platform}
          >
            <BrandIcon name={link.platform} />
          </a>
        </li>
      ))}
    </ul>
  )
}

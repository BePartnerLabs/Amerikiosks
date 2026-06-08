import type React from 'react'
import './styles.css'

type Props = {
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  align?: 'left' | 'center'
}

export const SectionHeader: React.FC<Props> = ({ eyebrow, heading, subtitle, align = 'left' }) => {
  return (
    <div className={`ak-section-header ak-section-header--${align}`}>
      {eyebrow && <p className="ak-section-header__eyebrow">{eyebrow}</p>}
      <h2 className="ak-section-header__heading">{heading}</h2>
      {subtitle && <p className="ak-section-header__subtitle">{subtitle}</p>}
    </div>
  )
}

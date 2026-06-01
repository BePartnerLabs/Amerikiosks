import Link from 'next/link'
import React from 'react'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import type { Footer } from '@/payload-types'

interface FooterContentProps {
  footer: Partial<Footer>
}

export function FooterContent({ footer }: FooterContentProps) {
  const { brandDescription, columns, contactEmail, contactCta, contactCtaUrl } = footer

  return (
    <footer className="ak-footer" itemScope itemType="https://schema.org/WPFooter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WPFooter' }),
        }}
      />
      <div className="bp-content-grid">
        <div className="breakout ak-footer__inner">
          {/* Brand column */}
          <div className="ak-footer__brand">
            <Link href="/" className="ak-footer__logo" aria-label="Go to homepage">
              <Logo />
            </Link>
            {brandDescription && (
              <p className="ak-footer__tagline">{brandDescription}</p>
            )}
          </div>

          {/* Nav columns */}
          {(columns ?? []).map((col, i) => (
            <div key={col.id ?? i} className="ak-footer__col">
              <p className="ak-footer__col-heading">{col.label}</p>
              <ul className="ak-footer__col-links" role="list">
                {(col.links ?? []).map(({ link, id }, j) => (
                  <li key={id ?? j} data-ga-event="footer_link_click" data-ga-section="footer">
                    <CMSLink {...link} className="ak-footer__link" />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          {(contactCta || contactEmail) && (
            <div className="ak-footer__col">
              <p className="ak-footer__col-heading">Contact</p>
              <ul className="ak-footer__col-links" role="list">
                {contactCta && (
                  <li
                    data-ga-event="footer_contact_click"
                    data-ga-section="footer"
                    data-ga-label={contactCta}
                  >
                    {contactCtaUrl ? (
                      <Link href={contactCtaUrl} className="ak-footer__link">{contactCta}</Link>
                    ) : (
                      <span className="ak-footer__link">{contactCta}</span>
                    )}
                  </li>
                )}
                {contactEmail && (
                  <li
                    data-ga-event="footer_contact_click"
                    data-ga-section="footer"
                    data-ga-label={contactEmail}
                  >
                    <a href={`mailto:${contactEmail}`} className="ak-footer__link">
                      {contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="breakout ak-footer__bottom">
          <p className="ak-footer__copyright">
            © {new Date().getFullYear()} Amerikiosks
          </p>
        </div>
      </div>
    </footer>
  )
}

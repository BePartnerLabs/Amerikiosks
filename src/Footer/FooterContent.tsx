import Link from 'next/link'
import { FormDrawerTrigger } from '@/components/FormDrawer'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { type SocialLink, SocialLinks } from '@/components/SocialLinks'
import type { Footer } from '@/payload-types'

interface FooterContentProps {
  footer: Partial<Footer>
  socialLinks?: SocialLink[] | null
}

export function FooterContent({ footer, socialLinks }: FooterContentProps) {
  const {
    brandDescription,
    columns,
    contactEmail,
    contactCta,
    contactCtaUrl,
    contactCtaType,
    contactCtaForm,
  } = footer

  // The global is fetched with depth 1, so a picked form arrives populated.
  const ctaForm =
    contactCtaType === 'modal' && contactCtaForm && typeof contactCtaForm === 'object'
      ? contactCtaForm
      : null

  return (
    <footer
      className="ak-footer"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: this is a json-ld script tag, not user-generated content
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WPFooter' }),
        }}
      />
      <div className="bp-content-grid">
        <div className="breakout ak-footer__inner">
          {/* Brand column */}
          <div className="ak-footer__brand">
            <Link
              href="/"
              className="ak-footer__logo"
              aria-label="Go to homepage"
            >
              <Logo />
            </Link>
            {brandDescription && <p className="ak-footer__tagline">{brandDescription}</p>}
          </div>

          {/* Nav columns — `hidden` lets an editor pull a column or a single
              link out of the footer without deleting it, same as the header's
              nav items. */}
          {(columns ?? [])
            .filter((col) => !col.hidden)
            .map((col, i) => (
              <div
                key={col.id ?? i}
                className="ak-footer__col"
              >
                <p className="ak-footer__col-heading">{col.label}</p>
                <ul className="ak-footer__col-links">
                  {(col.links ?? [])
                    .filter((l) => !l.hidden)
                    .map(({ link, id }, j) => (
                      <li
                        key={id ?? j}
                        data-ga-event="footer_link_click"
                        data-ga-section="footer"
                      >
                        <CMSLink
                          {...link}
                          className="ak-footer__link"
                        />
                      </li>
                    ))}
                </ul>
              </div>
            ))}

          {/* Contact column */}
          {(contactCta || contactEmail) && (
            <div className="ak-footer__col">
              <p className="ak-footer__col-heading">Contact</p>
              <ul className="ak-footer__col-links">
                {contactCta && (
                  <li
                    data-ga-event="footer_contact_click"
                    data-ga-section="footer"
                    data-ga-label={contactCta}
                  >
                    {ctaForm ? (
                      <FormDrawerTrigger
                        form={ctaForm}
                        className="ak-footer__link"
                      >
                        {contactCta}
                      </FormDrawerTrigger>
                    ) : contactCtaUrl ? (
                      <Link
                        href={contactCtaUrl}
                        className="ak-footer__link"
                      >
                        {contactCta}
                      </Link>
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
                    <a
                      href={`mailto:${contactEmail}`}
                      className="ak-footer__link"
                    >
                      {contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="breakout ak-footer__bottom">
          <p className="ak-footer__copyright">© {new Date().getFullYear()} Amerikiosks</p>
          <SocialLinks
            links={socialLinks}
            variant="footer"
          />
        </div>
      </div>
    </footer>
  )
}

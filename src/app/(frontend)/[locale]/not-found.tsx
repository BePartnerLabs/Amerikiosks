import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import './not-found.css'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <section
      className="ak-not-found"
      aria-label="Page not found"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-not-found__inner">
          <p
            className="ak-not-found__code"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="ak-not-found__heading">{t('heading')}</h1>
          <p className="ak-not-found__message">{t('message')}</p>
          <div className="ak-not-found__actions">
            <Link
              href="/"
              className="bp-btn bp-btn--primary"
            >
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

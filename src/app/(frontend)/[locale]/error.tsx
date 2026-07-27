'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import './error.css'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: Props) {
  const t = useTranslations('error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section
      className="ak-error-page"
      aria-label="Something went wrong"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-error-page__inner">
          <p
            className="ak-error-page__code"
            aria-hidden="true"
          >
            {t('code')}
          </p>
          <h1 className="ak-error-page__heading">{t('heading')}</h1>
          <p className="ak-error-page__message">{t('message')}</p>
          {error.digest && <p className="ak-error-page__digest">Ref: {error.digest}</p>}
          <div className="ak-error-page__actions">
            <button
              type="button"
              className="bp-btn bp-btn--primary"
              onClick={reset}
            >
              {t('retry')}
            </button>
            <Link
              href="/"
              className="bp-btn bp-btn--outline"
            >
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import './styles.css'

type Props = {
  expanded: boolean
  analyticsChecked: boolean
  onExpand: () => void
  onAnalyticsChange: (checked: boolean) => void
  onAcceptAll: () => void
  onReject: () => void
  onSave: () => void
}

export function ConsentBanner({
  expanded,
  analyticsChecked,
  onExpand,
  onAnalyticsChange,
  onAcceptAll,
  onReject,
  onSave,
}: Props) {
  const t = useTranslations('consent')

  return (
    <section
      className="ak-consent-banner"
      aria-label={t('ariaLabel')}
    >
      <div className="ak-consent-banner__inner">
        <p className="ak-consent-banner__text">{t('description')}</p>

        {!expanded ? (
          <div className="ak-consent-banner__actions">
            <button
              className="bp-btn bp-btn--secondary"
              type="button"
              onClick={onExpand}
            >
              {t('preferences')}
            </button>
            <button
              className="bp-btn bp-btn--ghost"
              type="button"
              onClick={onReject}
            >
              {t('reject')}
            </button>
            <button
              className="bp-btn"
              type="button"
              onClick={onAcceptAll}
            >
              {t('acceptAll')}
            </button>
          </div>
        ) : (
          <div className="ak-consent-banner__preferences">
            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('necessaryLabel')}
                aria-checked={true}
                checked
                disabled
                readOnly
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('necessaryLabel')}</span>
            </label>

            <label className="bp-toggle bp-toggle--sm">
              <input
                className="bp-toggle__input"
                type="checkbox"
                role="switch"
                aria-label={t('analyticsLabel')}
                aria-checked={analyticsChecked}
                checked={analyticsChecked}
                onChange={(e) => onAnalyticsChange(e.target.checked)}
              />
              <span
                className="bp-toggle__track"
                aria-hidden="true"
              >
                <span className="bp-toggle__thumb" />
              </span>
              <span className="bp-toggle__label">{t('analyticsLabel')}</span>
            </label>

            <button
              className="bp-btn"
              type="button"
              onClick={onSave}
            >
              {t('save')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

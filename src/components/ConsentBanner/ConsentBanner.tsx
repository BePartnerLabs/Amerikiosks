'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { InfoTooltip } from './InfoTooltip'
import './styles.css'

type Props = {
  expanded: boolean
  analyticsChecked: boolean
  /**
   * 'end' (bottom-right, the default first-appearance position) or 'start'
   * (bottom-left, used when reopened via the floating preferences button so
   * the panel appears next to the control that triggered it).
   */
  anchor?: 'end' | 'start'
  onExpand: () => void
  onAnalyticsChange: (checked: boolean) => void
  onAcceptAll: () => void
  onReject: () => void
  onSave: () => void
}

export function ConsentBanner({
  expanded,
  analyticsChecked,
  anchor = 'end',
  onExpand,
  onAnalyticsChange,
  onAcceptAll,
  onReject,
  onSave,
}: Props) {
  const t = useTranslations('consent')

  return (
    <section
      className={`ak-consent-card${anchor === 'start' ? ' ak-consent-card--start' : ''}`}
      aria-label={t('ariaLabel')}
    >
      <p className="ak-consent-card__text">
        {t('description')}{' '}
        <Link
          className="ak-consent-card__link"
          href="/cookie-policy"
        >
          {t('cookiePolicyLabel')}
        </Link>
      </p>

      {!expanded ? (
        <div className="ak-consent-card__actions">
          <button
            className="ak-consent-card__reject bp-btn"
            type="button"
            onClick={onReject}
          >
            {t('reject')}
          </button>
          <div className="ak-consent-card__actions-right">
            <button
              className="ak-consent-card__icon-btn bp-btn bp-btn--outline"
              type="button"
              aria-label={t('preferences')}
              title={t('preferences')}
              onClick={onExpand}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.7 6.3a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 1 1.6.3 6 6 0 0 1-8.1 8.1l-6.2 6.2a1.5 1.5 0 0 1-2.1-2.1l6.2-6.2a6 6 0 0 1 8.1-8.1 1 1 0 0 1 .3 1.6z" />
              </svg>
            </button>
            <button
              className="bp-btn"
              type="button"
              onClick={onAcceptAll}
            >
              {t('acceptAll')}
            </button>
          </div>
        </div>
      ) : (
        <div className="ak-consent-card__preferences">
          <div className="ak-consent-card__toggle-row">
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
            <InfoTooltip
              id="consent-necessary-tooltip"
              label={t('necessaryInfoLabel')}
              description={t('necessaryDescription')}
            />
          </div>

          <div className="ak-consent-card__toggle-row">
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
            <InfoTooltip
              id="consent-analytics-tooltip"
              label={t('analyticsInfoLabel')}
              description={t('analyticsDescription')}
            />
          </div>

          <button
            className="bp-btn"
            type="button"
            onClick={onSave}
          >
            {t('save')}
          </button>
        </div>
      )}
    </section>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import './styles.css'

type Props = {
  onClick: () => void
}

export function ConsentPreferencesButton({ onClick }: Props) {
  const t = useTranslations('consent')

  return (
    <button
      className="ak-consent-reopen-btn"
      type="button"
      aria-label={t('reopenAriaLabel')}
      title={t('reopenAriaLabel')}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 9.54 13.03c-.5.14-1.03.22-1.54.22a5.5 5.5 0 0 1-5.5-5.5c0-.4.04-.8.13-1.17A4.5 4.5 0 0 1 10.5 4.13c0-.5.08-1 .22-1.5A10.05 10.05 0 0 0 12 2Z" />
        <circle
          cx="8.5"
          cy="10.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
        <circle
          cx="7"
          cy="15"
          r="1"
          fill="currentColor"
          stroke="none"
        />
        <circle
          cx="11.5"
          cy="16.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </button>
  )
}

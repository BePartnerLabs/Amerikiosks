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
      className="ak-consent-reopen-btn bp-btn bp-btn--ghost"
      type="button"
      aria-label={t('reopenAriaLabel')}
      onClick={onClick}
    >
      {t('reopenAriaLabel')}
    </button>
  )
}

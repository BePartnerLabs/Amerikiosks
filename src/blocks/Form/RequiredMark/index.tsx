'use client'

import { useTranslations } from 'next-intl'

/**
 * The asterisk next to a required field's label, plus its screen-reader text.
 * Shared so the "(required)" string lives in one place — it used to be
 * hardcoded in English across all nine field components.
 */
export const RequiredMark = () => {
  const t = useTranslations('form')

  return (
    <span className="required">
      * <span className="sr-only">{t('requiredMark')}</span>
    </span>
  )
}

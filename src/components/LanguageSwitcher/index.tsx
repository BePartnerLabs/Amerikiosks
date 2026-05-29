'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchTo = (target: string) => {
    if (target === locale) return

    let newPath: string
    if (target === 'en') {
      newPath = pathname.replace(/^\/es(\/|$)/, '/') || '/'
    } else {
      newPath = pathname.startsWith('/es') ? pathname : `/es${pathname}`
    }

    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={locale === 'en' ? 'text-white' : 'text-white/50 hover:text-white/80 transition-colors'}
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        EN
      </button>
      <span className="text-white/30">|</span>
      <button
        type="button"
        onClick={() => switchTo('es')}
        className={locale === 'es' ? 'text-white' : 'text-white/50 hover:text-white/80 transition-colors'}
        aria-current={locale === 'es' ? 'true' : undefined}
      >
        ES
      </button>
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/utilities/useDebounce'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const t = useTranslations('search')

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="bp-field">
          <label
            className="bp-field__label"
            htmlFor="search"
          >
            {t('heading')}
          </label>
          <input
            className="bp-input"
            id="search"
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder={t('placeholder')}
          />
        </div>
        <button
          className="bp-btn"
          type="submit"
        >
          submit
        </button>
      </form>
    </div>
  )
}

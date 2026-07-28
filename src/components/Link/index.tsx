'use client'
import Link from 'next/link'
import type React from 'react'
import { FormDrawerTrigger } from '@/components/FormDrawer'
import type { Form, Insight, Page } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'default' | 'outline' | 'link' | 'ghost' | 'dark' | null
  children?: React.ReactNode
  className?: string
  label?: string | null
  modalForm?: Form | string | number | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'insights'
    value: Page | Insight | string | number
  } | null
  size?: string | null
  type?: 'custom' | 'reference' | 'modal' | null
  url?: string | null
}

// Maps CMS appearance values to DS bp-btn modifier classes
const appearanceClass: Record<string, string> = {
  default: 'bp-btn bp-btn--primary',
  outline: 'bp-btn bp-btn--outline',
  dark: 'bp-btn bp-btn--dark',
  ghost: 'bp-btn bp-btn--ghost',
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    modalForm,
    newTab,
    reference,
    url,
  } = props

  if (type === 'modal') {
    if (!modalForm || typeof modalForm !== 'object') return null

    const btnClass =
      appearance && appearance !== 'inline' && appearance !== 'link'
        ? (appearanceClass[appearance] ?? 'bp-btn bp-btn--primary')
        : ''

    return (
      <FormDrawerTrigger
        form={modalForm}
        className={`${btnClass}${className ? ` ${className}` : ''}`}
      >
        {label}
        {children}
      </FormDrawerTrigger>
    )
  }

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  if (appearance === 'inline' || appearance === 'link') {
    return (
      <Link
        className={className ?? ''}
        href={href}
        {...newTabProps}
      >
        {label}
        {children}
      </Link>
    )
  }

  const btnClass = appearanceClass[appearance ?? 'default'] ?? 'bp-btn bp-btn--primary'

  return (
    <Link
      className={`${btnClass}${className ? ` ${className}` : ''}`}
      href={href}
      {...newTabProps}
    >
      {label}
      {children}
    </Link>
  )
}

'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { FormBlock } from '@/blocks/Form/Component'
import type { Form, Insight, Page } from '@/payload-types'
import './link-drawer.css'

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

  const drawerId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only modal-type links need the portal — avoid an extra re-render for
    // every plain <Link> usage of this component (Header, Footer, CTAs...).
    if (type === 'modal') setMounted(true)
  }, [type])

  if (type === 'modal') {
    if (!modalForm || typeof modalForm !== 'object') return null

    const btnClass =
      appearance && appearance !== 'inline' && appearance !== 'link'
        ? (appearanceClass[appearance] ?? 'bp-btn bp-btn--primary')
        : ''

    const drawer = (
      <div
        id={drawerId}
        popover=""
        className="ak-link-drawer"
      >
        <div className="ak-link-drawer__header">
          {modalForm.title && <h2 className="ak-link-drawer__title">{modalForm.title}</h2>}
          <button
            type="button"
            popoverTarget={drawerId}
            popoverTargetAction="hide"
            aria-label="Close"
            className="ak-link-drawer__close"
          >
            ×
          </button>
        </div>
        <FormBlock
          enableIntro={false}
          form={modalForm as unknown as FormType}
        />
      </div>
    )

    return (
      <>
        <button
          type="button"
          popoverTarget={drawerId}
          className={`${btnClass}${className ? ` ${className}` : ''}`}
        >
          {label}
          {children}
        </button>
        {/* Portaled to document.body — a popover rendered wherever CMSLink
            happens to live (hero, header, footer, CTA…) would otherwise
            inherit that context's ambient CSS (e.g. a hero's oversized
            heading styles bleeding into the drawer's own title). */}
        {mounted ? createPortal(drawer, document.body) : null}
      </>
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

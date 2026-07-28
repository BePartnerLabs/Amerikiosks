'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { FormBlock } from '@/blocks/Form/Component'
import type { Form } from '@/payload-types'
import './styles.css'

// `form` shadows the native button attribute (a form id string), so drop it.
type FormDrawerTriggerProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'form'> & {
  form: Form
}

/**
 * Renders any trigger (button, card, panel…) that opens a Payload form inside a
 * popover drawer instead of navigating. Shared by CMSLink and by the blocks
 * whose whole card can be either a link or a form trigger (AudienceShowcase,
 * ModelLines).
 */
export const FormDrawerTrigger: React.FC<FormDrawerTriggerProps> = ({
  form,
  children,
  ...buttonProps
}) => {
  const drawerId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const drawer = (
    <div
      id={drawerId}
      popover=""
      className="ak-link-drawer"
    >
      <div className="ak-link-drawer__header">
        {form.title && <h2 className="ak-link-drawer__title">{form.title}</h2>}
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
        form={form as unknown as FormType}
      />
    </div>
  )

  return (
    <>
      <button
        type="button"
        popoverTarget={drawerId}
        {...buttonProps}
      >
        {children}
      </button>
      {/* Portaled to document.body — a popover rendered wherever the trigger
          happens to live (hero, header, footer, card grid…) would otherwise
          inherit that context's ambient CSS (e.g. a hero's oversized heading
          styles bleeding into the drawer's own title). */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  )
}

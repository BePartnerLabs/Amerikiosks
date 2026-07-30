'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
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
  const t = useTranslations('form')
  const drawerId = useId()
  const [mounted, setMounted] = useState(false)
  // The drawer lives in a portal that outlives every open/close, so FormBlock's
  // submitted state would survive with it — reopening showed the previous
  // visit's thank-you instead of a fresh form. Remounting on close is simpler
  // and less brittle than reaching into FormBlock to reset it.
  const [instance, setInstance] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // `mounted` is the trigger, not an input: drawerRef is only populated once
  // the portal renders, so this must re-run after that flips.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return

    // iOS does not shrink the layout viewport for the keyboard: it keeps the
    // page the same size and slides the *visual* viewport up, then scrolls the
    // document to reveal the focused field. A `position: fixed` drawer is
    // anchored to the layout viewport, so it stays where the page went — which
    // is why every tap on an input appeared to drag the drawer downwards.
    //
    // Pinning it to the visual viewport's own top and height cancels exactly
    // that offset. `interactiveWidget: 'resizes-content'` (see the layout's
    // viewport export) covers Chromium; this covers Safari, which ignores it.
    const viewport = window.visualViewport
    const pin = () => {
      if (!viewport) return
      el.style.setProperty('--ak-drawer-top', `${viewport.offsetTop}px`)
      el.style.setProperty('--ak-drawer-height', `${viewport.height}px`)
    }
    const unpin = () => {
      el.style.removeProperty('--ak-drawer-top')
      el.style.removeProperty('--ak-drawer-height')
    }

    const onToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === 'open'
      if (open) {
        pin()
        viewport?.addEventListener('resize', pin)
        viewport?.addEventListener('scroll', pin)
        return
      }
      viewport?.removeEventListener('resize', pin)
      viewport?.removeEventListener('scroll', pin)
      unpin()
      setInstance((n) => n + 1)
    }

    el.addEventListener('toggle', onToggle)
    return () => {
      el.removeEventListener('toggle', onToggle)
      viewport?.removeEventListener('resize', pin)
      viewport?.removeEventListener('scroll', pin)
    }
  }, [mounted])

  const close = useCallback(() => {
    drawerRef.current?.hidePopover()
  }, [])

  const drawer = (
    <div
      ref={drawerRef}
      id={drawerId}
      popover=""
      className="ak-link-drawer"
    >
      <div
        className="ak-link-drawer__accent"
        aria-hidden="true"
      />
      <div className="ak-link-drawer__header">
        {form.title && <h2 className="ak-link-drawer__title">{form.title}</h2>}
        <button
          type="button"
          popoverTarget={drawerId}
          popoverTargetAction="hide"
          aria-label={t('closeForm')}
          className="ak-link-drawer__close"
        >
          ×
        </button>
      </div>
      <FormBlock
        key={instance}
        enableIntro={false}
        form={form as unknown as FormType}
        onRequestClose={close}
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

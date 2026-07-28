'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { TEXT_SCALES, type TextScale } from '@/utilities/a11yPrefs'
import { createReadAloud, isSpeechSupported, READABLE_SELECTOR } from './readAloud'
import { useA11yPrefs } from './useA11yPrefs'
import './styles.css'

const SCALE_LABEL_KEYS: Record<TextScale, string> = {
  1: 'textSizeNormal',
  1.15: 'textSizeLarge',
  1.3: 'textSizeLarger',
}

export function AccessibilityWidget() {
  const t = useTranslations('accessibility')
  const { prefs, setPref, reset } = useA11yPrefs()
  const [open, setOpen] = useState(false)
  const [readAloud, setReadAloud] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()

  // Feature detection runs after mount: on the server there is no window, and
  // rendering the control then removing it would be a hydration mismatch.
  useEffect(() => {
    setSpeechAvailable(isSpeechSupported())
  }, [])

  const controller = useMemo(() => createReadAloud(() => document.documentElement.lang || 'en'), [])

  const closePanel = useCallback(() => {
    setOpen(false)
    fabRef.current?.focus()
  }, [])

  // Esc closes the panel from anywhere and always stops speech — a user who
  // wants the talking to stop shouldn't have to find the right button first.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      controller.stop()
      if (open) closePanel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closePanel, controller])

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector<HTMLElement>('button, input')
    first?.focus()
  }, [open])

  // Click-to-read. Bound to the document rather than to each node so it keeps
  // working across client-side navigations without re-binding per page.
  useEffect(() => {
    if (!readAloud) return

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      if (!target) return
      // Never read the widget's own controls — that would make the panel
      // unusable while the mode is on.
      if (target.closest('.ak-a11y-fab, .ak-a11y-panel')) return

      const main = document.getElementById('main-content')
      if (!main?.contains(target)) return

      const readable = target.closest<HTMLElement>(READABLE_SELECTOR)
      if (!readable) return

      controller.speak(readable.textContent ?? '')
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [readAloud, controller])

  // Stop speech if the widget unmounts (route change, layout swap).
  useEffect(() => () => controller.stop(), [controller])

  function toggle(key: 'contrast' | 'highlightLinks' | 'reduceMotion', label: string) {
    const next = !prefs[key]
    setPref(key, next)
    setAnnouncement(`${label} ${next ? t('on') : t('off')}`)
  }

  function toggleReadAloud() {
    const next = !readAloud
    setReadAloud(next)
    if (!next) controller.stop()
    setAnnouncement(`${t('readAloud')} ${next ? t('on') : t('off')}`)
  }

  return (
    <>
      <button
        ref={fabRef}
        className="ak-a11y-fab"
        type="button"
        aria-label={t('fabLabel')}
        title={t('fabLabel')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
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
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <circle
            cx="12"
            cy="7.5"
            r="1.25"
            fill="currentColor"
            stroke="none"
          />
          <path d="M7 10.25h10" />
          <path d="M12 10.5v4m0 0-2.25 4m2.25-4 2.25 4" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="ak-a11y-panel"
          role="dialog"
          aria-labelledby={titleId}
        >
          <div className="ak-a11y-panel__header">
            <h2
              id={titleId}
              className="ak-a11y-panel__title"
            >
              {t('title')}
            </h2>
            <button
              className="ak-a11y-panel__close"
              type="button"
              aria-label={t('close')}
              onClick={closePanel}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <fieldset className="ak-a11y-group">
            <legend className="ak-a11y-group__legend">{t('textSize')}</legend>
            {/* Native radios rather than role="radio" buttons: the fieldset +
                legend already forms the group, and arrow-key navigation comes
                free from the browser instead of a hand-rolled roving tabindex. */}
            <div className="ak-a11y-scale">
              {TEXT_SCALES.map((scale) => (
                <label
                  key={scale}
                  className="ak-a11y-scale__option"
                >
                  <input
                    className="ak-a11y-sr-only"
                    type="radio"
                    name={`${panelId}-text-scale`}
                    checked={prefs.textScale === scale}
                    onChange={() => {
                      setPref('textScale', scale)
                      setAnnouncement(`${t('textSize')} ${t(SCALE_LABEL_KEYS[scale])}`)
                    }}
                  />
                  <span>{t(SCALE_LABEL_KEYS[scale])}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="ak-a11y-toggles">
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.contrast}
              onClick={() => toggle('contrast', t('contrast'))}
            >
              {t('contrast')}
            </button>
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.highlightLinks}
              onClick={() => toggle('highlightLinks', t('highlightLinks'))}
            >
              {t('highlightLinks')}
            </button>
            <button
              className="ak-a11y-toggle"
              type="button"
              aria-pressed={prefs.reduceMotion}
              onClick={() => toggle('reduceMotion', t('reduceMotion'))}
            >
              {t('reduceMotion')}
            </button>
            {speechAvailable && (
              <button
                className="ak-a11y-toggle"
                type="button"
                aria-pressed={readAloud}
                onClick={toggleReadAloud}
              >
                {t('readAloud')}
              </button>
            )}
          </div>

          {speechAvailable && readAloud && (
            <>
              <p className="ak-a11y-hint">{t('readAloudHint')}</p>
              <button
                className="ak-a11y-stop"
                type="button"
                onClick={() => controller.stop()}
              >
                {t('stopReading')}
              </button>
            </>
          )}

          <button
            className="ak-a11y-reset"
            type="button"
            onClick={() => {
              reset()
              setReadAloud(false)
              controller.stop()
              setAnnouncement(t('reset'))
            }}
          >
            {t('reset')}
          </button>

          <p
            className="ak-a11y-sr-only"
            aria-live="polite"
          >
            {announcement}
          </p>
        </div>
      )}
    </>
  )
}

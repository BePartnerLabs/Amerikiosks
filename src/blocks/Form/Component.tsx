'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FieldValues, UseFormRegister } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import RichText from '@/components/RichText'
import { FormsRepository } from '@/repositories'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { fields } from './fields'
import { useTurnstile } from './useTurnstile'
import './styles.css'

type Gtag = (
  command: 'event',
  eventName: string,
  params: { form_name?: string; locale?: string },
) => void

/** Fields the formOverrides in src/plugins/index.ts add on top of the plugin's own. */
type ExtendedForm = FormType & {
  description?: DefaultTypedEditorState
  footnote?: DefaultTypedEditorState
  confirmationHeading?: string
  confirmationNext?: string
  requiresConsent?: boolean
  consentText?: DefaultTypedEditorState
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  /** 'split' puts the intro in a panel beside the fields — full-page only. */
  layout?: 'stacked' | 'split'
  /** Split only — mirrors the mega menu's left panel (eyebrow + headline). */
  panelLabel?: string | null
  panelHeadline?: string | null
  /** Set by FormDrawer — adds a Close button to the confirmation state. */
  onRequestClose?: () => void
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    blockName,
    blockType,
    enableIntro,
    form: formFromProps,
    form: {
      id: formID,
      confirmationMessage,
      confirmationType,
      redirect,
      submitButtonLabel,
      title,
    } = {},
    introContent,
    layout = 'stacked',
    panelLabel,
    panelHeadline,
    onRequestClose,
  } = props

  const t = useTranslations('form')

  const {
    description,
    footnote,
    confirmationHeading,
    confirmationNext,
    requiresConsent,
    consentText,
  } = formFromProps as ExtendedForm

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
    // Surface a field's error when the visitor leaves it, not only on submit —
    // in a 16-field drawer the submit-time error can be three screens away.
    mode: 'onTouched',
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setFocus,
  } = formMethods

  // The form's value shape is the CMS-defined field list, so react-hook-form is
  // generically typed to FormFieldBlock[]. The consent box is a fixed extra
  // control outside that list, hence the narrow casts here.
  const consentError = Boolean((errors as unknown as Record<string, unknown>).consent)
  const registerConsent = register as unknown as UseFormRegister<FieldValues>

  const router = useRouter()
  // The widget is only worth creating once someone actually touches this form.
  // Every drawer on the page mounts its own FormBlock, so rendering one on
  // mount meant a dozen Cloudflare challenges competing on a single page load.
  const [isEngaged, setIsEngaged] = useState(false)
  const turnstile = useTurnstile(isEngaged)

  // Anything submitted faster than the route's threshold is treated as a bot.
  const renderedAtRef = useRef<number>(Date.now())
  const honeypotRef = useRef<HTMLInputElement>(null)

  // Submitting a long form and seeing nothing happen — because the offending
  // field is three screens up — is the worst failure mode in the drawer.
  const [invalidFields, setInvalidFields] = useState<{ name: string; label: string }[]>([])
  // Only meaningful while a submission carrying a file is in flight; the
  // Upload field renders its own bar from it.
  const [uploadPercent, setUploadPercent] = useState<number | undefined>(undefined)
  const summaryRef = useRef<HTMLDivElement>(null)

  const {
    mutate,
    isPending: isLoading,
    isSuccess: hasSubmitted,
    error: mutationError,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (data: FormFieldBlock[]) => {
      // `useForm({ defaultValues: formFromProps.fields })` seeds the form state
      // from the fields *array*, so `data` also carries its numeric indices
      // ("0", "1", …) whose values are whole field-config objects. Payload's
      // own endpoint ignored those; our route validates what it is given and
      // rejects anything the form does not declare, which turned every real
      // submission into a 400. Send only the declared fields.
      const declared = new Set(
        (formFromProps?.fields ?? [])
          .filter((f) => 'name' in f)
          .map((f) => (f as { name: string }).name),
      )
      if (requiresConsent) declared.add('consent')

      const submissionData = Object.entries(data)
        .filter(([field]) => declared.has(field))
        .map(([field, value]) => ({ field, value }))
      const hasFile = submissionData.some((entry) => entry.value instanceof File)
      if (hasFile) setUploadPercent(0)

      return FormsRepository.submit(
        {
          form: formID ?? '',
          submissionData,
          honeypot: honeypotRef.current?.value || undefined,
          renderedAt: renderedAtRef.current,
          turnstileToken: turnstile.token,
        },
        hasFile ? setUploadPercent : undefined,
      )
    },
    onSuccess: () => {
      if (confirmationType === 'redirect' && redirect?.url) {
        // The success node below (which carries data-ga-event) never renders for
        // redirect confirmations, so without this the lead goes untracked.
        const g = (window as Window & { gtag?: Gtag }).gtag
        if (typeof g === 'function') {
          g('event', 'generate_lead', {
            form_name: title,
            locale: document.documentElement.lang || undefined,
          })
        }
        router.push(redirect.url)
      }
    },
    onSettled: () => setUploadPercent(undefined),
    onError: (err) => {
      // The visitor gets the sentence below; the technical detail belongs in
      // the console, not on screen (this used to render as "500: Not Found").
      console.error('[form] submission failed:', err)
      turnstile.reset()
    },
  })

  const lastDataRef = useRef<FormFieldBlock[] | undefined>(undefined)
  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      setInvalidFields([])
      lastDataRef.current = data
      mutate(data)
    },
    [mutate],
  )

  const onInvalid = useCallback(() => {
    const labelByName = new Map(
      (formFromProps?.fields ?? [])
        .filter((f) => 'name' in f)
        .map((f) => [
          (f as { name: string }).name,
          (f as { label?: string; name: string }).label || (f as { name: string }).name,
        ]),
    )
    const found = Object.keys(errors)
      .filter((name) => labelByName.has(name))
      .map((name) => ({ name, label: labelByName.get(name) as string }))

    setInvalidFields(found)
    // Focus beats scroll here: it moves the screen reader too, and the browser
    // scrolls the focused control into view for free.
    const first = found[0]?.name
    if (first) setFocus(first as never)
    summaryRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [errors, formFromProps, setFocus])

  const retry = useCallback(() => {
    resetMutation()
    if (lastDataRef.current) mutate(lastDataRef.current)
  }, [mutate, resetMutation])

  // GAListener only listens for clicks, so an async form success (no click
  // of its own) needs a synthetic one on mount to dispatch generate_lead —
  // same pattern as ClaimForm's success node. The focus/scroll below rides
  // along in the same effect: without it the confirmation is silent for
  // screen readers and can render below the fold in the drawer.
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.click()
      successRef.current?.focus()
      successRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [hasSubmitted])

  // Progress counts *required* fields only, so 100% means "you can submit".
  // Counting every field made the bar permanently incomplete for anyone who
  // legitimately skipped the optional ones, and it made a switch ambiguous:
  // left off on purpose is an answer, but it looked like a gap.
  const requiredFields = (formFromProps?.fields ?? []).filter(
    (f) => 'name' in f && (f as { required?: boolean }).required,
  ) as unknown as { name: string }[]
  const watched = useWatch({ control })
  const answeredCount = requiredFields.filter((f) => {
    const value = (watched as unknown as Record<string, unknown>)?.[f.name]
    // A required boolean means "must be on" — an unticked consent box is not a
    // completed answer, it is the thing blocking the submit.
    if (typeof value === 'boolean') return value
    return value !== undefined && value !== null && value !== ''
  }).length
  // Below a handful of required fields there is nothing to reassure anyone
  // about, and a bar stuck at 1/2 reads worse than no bar.
  const showProgress = requiredFields.length >= 4

  const intro = enableIntro && introContent && !hasSubmitted && (
    <RichText
      className="ak-form__intro"
      data={introContent}
      enableGutter={false}
    />
  )

  const body = (
    <div className="ak-form__card">
      <FormProvider {...formMethods}>
        {!isLoading && hasSubmitted && confirmationType === 'message' && (
          <div
            ref={successRef}
            className="ak-form__success"
            data-testid="form-block-success"
            data-ga-event="generate_lead"
            data-ga-form-name={title}
            data-ga-label={title}
            role="status"
            aria-live="polite"
            tabIndex={-1}
          >
            <span
              className="ak-form__success-check"
              aria-hidden="true"
            >
              <span className="ak-form__success-ring" />✓
            </span>
            {confirmationHeading && (
              <h3 className="ak-form__success-heading">{confirmationHeading}</h3>
            )}
            <div className="ak-form__success-body">
              <RichText data={confirmationMessage} />
            </div>
            {confirmationNext && <p className="ak-form__success-next">{confirmationNext}</p>}
            {onRequestClose && (
              <button
                className="bp-btn bp-btn--dark ak-form__success-close"
                type="button"
                onClick={onRequestClose}
              >
                {t('successClose')}
              </button>
            )}
          </div>
        )}
        {isLoading && !hasSubmitted && <p className="ak-form__loading">{t('loading')}</p>}
        {mutationError && !isLoading && (
          <div
            className="ak-form__status ak-form__status--error"
            role="alert"
          >
            {t('submitError')}
            <button
              className="ak-form__retry"
              type="button"
              onClick={retry}
            >
              {t('retry')}
            </button>
          </div>
        )}
        {!hasSubmitted && (
          <form
            id={formID}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            // Focus rather than change: the token takes a moment to arrive, so
            // it should start as soon as the visitor reaches the first field
            // rather than after they have finished typing in it.
            onFocusCapture={() => setIsEngaged(true)}
          >
            {invalidFields.length > 0 && (
              <div
                ref={summaryRef}
                className="ak-form__summary"
                role="alert"
              >
                <p className="ak-form__summary-title">
                  {t('summary', { count: invalidFields.length })}
                </p>
                <ul className="ak-form__summary-list">
                  {invalidFields.map((field) => (
                    <li key={field.name}>
                      <button
                        type="button"
                        onClick={() => setFocus(field.name as never)}
                      >
                        {field.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Not a real field — a person never sees it, a naive bot fills it. */}
            <input
              ref={honeypotRef}
              className="ak-form__honeypot"
              name="website_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="ak-form__fields">
              {formFromProps?.fields?.map((field, index) => {
                const Field = fields?.[field.blockType as keyof typeof fields] as
                  | React.ComponentType<Record<string, unknown>>
                  | undefined
                const fieldKey =
                  (field as { id?: string; name?: string; blockName?: string }).id ||
                  (field as { id?: string; name?: string; blockName?: string }).name ||
                  (field as { id?: string; name?: string; blockName?: string }).blockName ||
                  `${field.blockType}-field-${index}`
                if (Field) {
                  return (
                    <Field
                      key={fieldKey}
                      form={formFromProps}
                      {...field}
                      {...formMethods}
                      control={control}
                      errors={errors}
                      register={register}
                      uploadPercent={uploadPercent}
                    />
                  )
                }
                return null
              })}
            </div>

            {requiresConsent && (
              <div className="ak-form__consent bp-checkbox-field">
                {/* The wording is NOT wrapped in a <label>. It is expected to
                    contain a link to the privacy policy, and a label forwards
                    every click to its control — so following that link would
                    also tick or untick the box. The checkbox is named through
                    aria-labelledby instead, which keeps the association for
                    assistive tech without stealing the link's clicks. */}
                <div className="bp-checkbox ak-form__consent-row">
                  <input
                    className="bp-checkbox__input"
                    id="consent"
                    type="checkbox"
                    aria-labelledby="consent-text"
                    aria-invalid={consentError}
                    aria-describedby={consentError ? 'consent-error' : undefined}
                    {...registerConsent('consent', { required: true })}
                  />
                  {consentText ? (
                    <RichText
                      className="ak-form__consent-text"
                      id="consent-text"
                      data={consentText}
                      enableGutter={false}
                    />
                  ) : null}
                </div>
                {consentError && (
                  <p
                    className="bp-checkbox-field__error"
                    id="consent-error"
                    role="alert"
                  >
                    {t('errors.required')}
                  </p>
                )}
              </div>
            )}

            {turnstile.enabled && (
              <div
                ref={turnstile.containerRef}
                className="ak-form__turnstile"
              />
            )}

            <div className="ak-form__actions">
              {showProgress && (
                <div className="ak-form__progress">
                  <span className="ak-form__progress-count">
                    {answeredCount} / {requiredFields.length}
                  </span>
                  <span
                    className="ak-form__progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={requiredFields.length}
                    aria-valuenow={answeredCount}
                    aria-label={t('progressLabel')}
                  >
                    <span
                      className="ak-form__progress-bar"
                      style={{
                        inlineSize: `${Math.round((answeredCount / requiredFields.length) * 100)}%`,
                      }}
                    />
                  </span>
                </div>
              )}
              {/* The label carries the pending state, not just the disabled
                  attribute: in the drawer the submit button is sticky at the
                  bottom while the status message sits at the top of a scrolled
                  form, so the button is the only thing the visitor is looking
                  at when they click it. */}
              <button
                className="bp-btn bp-btn--dark ak-form__submit"
                form={formID}
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? t('sending') : submitButtonLabel}
              </button>
            </div>

            {footnote && (
              <RichText
                className="ak-form__footnote"
                data={footnote}
                enableGutter={false}
              />
            )}
          </form>
        )}
      </FormProvider>
    </div>
  )

  // Split only pays off when there is something to put in the panel. Its
  // markup mirrors the mega menu's left panel (accent bar → eyebrow →
  // headline → description) so the two read as the same component family.
  const hasPanelContent = panelLabel || panelHeadline || (enableIntro && introContent)
  const isSplit = layout === 'split' && Boolean(hasPanelContent)

  // Only a Form rendered straight from a page's `layout` array gets the section
  // chrome (landmark, GA attributes, DS grid). `blockType` is what tells the two
  // apart: RenderBlocks spreads the whole block, while FormDrawer and
  // FAQWithForm mount this component by hand inside their own section — those
  // must not grow a nested landmark or a second grid.
  const withChrome = (content: React.ReactNode) => {
    if (blockType !== 'formBlock') return content
    return (
      <section
        className="ak-form-block"
        aria-label={blockName ?? title ?? undefined}
        data-ga-block={toSnakeCase(blockType)}
        data-ga-section={blockName ?? undefined}
      >
        {/* The content zone (max 1344px) is wider than both layouts — 48rem
            stacked, 64rem split — so neither needs breakout; what the grid adds
            is the shared page gutter on narrow screens, which .ak-form's own
            max-width was not providing. */}
        <div className="bp-content-grid">{content}</div>
      </section>
    )
  }

  if (isSplit) {
    return withChrome(
      <div
        className="ak-form ak-form--split"
        data-layout="split"
      >
        <aside className="ak-form__aside">
          <span
            className="ak-form__aside-accent"
            aria-hidden="true"
          />
          {panelLabel && <p className="ak-form__aside-eyebrow">{panelLabel}</p>}
          {panelHeadline && <h2 className="ak-form__aside-headline">{panelHeadline}</h2>}
          {enableIntro && introContent && (
            <RichText
              className="ak-form__aside-description"
              data={introContent}
              enableGutter={false}
            />
          )}
        </aside>
        {body}
      </div>,
    )
  }

  return withChrome(
    <div className="ak-form">
      {intro}
      {/* The drawer has no block-level intro of its own — this is the Form
          document's own description, which is what the modal design shows
          under the title. */}
      {description && !hasSubmitted && (
        <RichText
          className="ak-form__description"
          data={description}
          enableGutter={false}
        />
      )}
      {body}
    </div>,
  )
}

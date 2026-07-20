'use client'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Path } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { ClaimsRepository } from '@/repositories'
import type { ClaimFormData } from '@/repositories/ClaimsRepository'
import './styles.css'

export type ClaimFormBlockType = {
  blockName?: string
  blockType?: 'claimForm'
  submitButtonLabel?: string
}

type Brand = { id: number | string; name: string; logoUrl?: string }
type FormValues = Omit<ClaimFormData, 'machineId' | 'photo'>

// Fixes the JotForm bug found in the live-site audit: the confirmation email
// showed "Type a question" for 5 of 11 fields instead of the real label.
const FIELD_LABELS: Record<string, string> = {
  kioskBrand: 'Kiosk Brand',
  paymentMethod: 'Payment Method',
  customerName: 'Name',
  customerEmail: 'Email',
  customerPhone: 'Phone Number',
  transactionDateTime: 'Date and Time of the Transaction',
  claimReason: 'What Happened',
  additionalInfo: 'Additional Information',
  lastFourCardDigits: 'Last 4 Digits of the Card',
  refundMethod: 'Refund Method',
  refundAccount: 'Refund Account',
  machineId: 'Machine ID',
}

const PAYMENT_METHODS = [
  {
    value: 'card',
    label: 'Credit/Debit Card',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
        />
        <path
          d="M2 10h20"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: 'cash',
    label: 'Cash',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect
          x="2"
          y="6"
          width="20"
          height="12"
          rx="2"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
    ),
  },
  {
    value: 'google_pay',
    label: 'Google Pay',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
        />
      </svg>
    ),
  },
  {
    value: 'apple_pay',
    label: 'Apple Pay',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
        />
        <path
          d="M12 8v8M8 12h8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

const CLAIM_REASONS = [
  { value: 'partial_dispense', label: 'Only part of my order was dispensed' },
  { value: 'damaged_product', label: 'The product was damaged' },
  { value: 'wrong_product', label: 'I received the wrong product' },
  { value: 'no_product', label: "I didn't receive my product" },
]

// Values match Claims.refundMethod's select options and JotForm's "Select a
// refund method" option text verbatim.
const REFUND_METHODS = [
  { value: 'Zelle', label: 'Zelle' },
  { value: 'CashApp', label: 'CashApp' },
  { value: 'Paypal', label: 'PayPal' },
  { value: 'Venmo', label: 'Venmo' },
]

const nowForDateTimeLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

type Step = { key: string; fields: Path<FormValues>[]; required: boolean }

const BASE_STEPS: Step[] = [
  { key: 'kioskBrand', fields: ['kioskBrand'], required: true },
  { key: 'paymentMethod', fields: ['paymentMethod'], required: true },
  { key: 'customerName', fields: ['customerName'], required: true },
  { key: 'customerEmail', fields: ['customerEmail'], required: true },
  { key: 'customerPhone', fields: ['customerPhone'], required: true },
  { key: 'transactionDateTime', fields: ['transactionDateTime'], required: true },
  {
    key: 'location',
    fields: ['location.state', 'location.city', 'location.propertyName'],
    required: true,
  },
  { key: 'claimReason', fields: ['claimReason'], required: true },
  { key: 'additionalInfo', fields: ['additionalInfo'], required: false },
]

// Card refunds go back to the card automatically (card + digits step); cash
// refunds need a destination account instead (refundMethod + refundAccount) —
// mirrors the branching audited on the live JotForm (qid 18/20/21), condensed
// into two straightforward extra steps instead of cloning its image+yes/no flow.
const CARD_STEPS: Step[] = [
  { key: 'lastFourCardDigits', fields: ['lastFourCardDigits'], required: false },
]
const CASH_STEPS: Step[] = [
  { key: 'refundMethod', fields: ['refundMethod'], required: true },
  { key: 'refundAccount', fields: ['refundAccount'], required: true },
]
const PHOTO_STEP: Step = { key: 'photo', fields: [], required: false }

export const ClaimFormBlock: React.FC<{ id?: string; brands: Brand[] } & ClaimFormBlockType> = ({
  brands,
  submitButtonLabel = 'Submit claim',
}) => {
  const searchParams = useSearchParams()
  const machineId = searchParams?.get('machine_id') ?? undefined
  const successRef = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState<File | undefined>(undefined)
  const [photoError, setPhotoError] = useState<string | undefined>(undefined)

  // step -1 = intro screen, 0..STEPS.length-1 = one field group per screen
  // (mirrors the 11-screen flow audited on Amerikiosks' current JotForm).
  const [step, setStep] = useState(-1)

  const {
    register,
    trigger,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { transactionDateTime: nowForDateTimeLocal() },
  })

  const paymentMethod = watch('paymentMethod')

  // Branches only once a payment method is actually chosen (paymentMethod is ''
  // pre-selection) — card vs. cash follow-up steps, plus the optional photo step
  // shared by both, appended after the base flow.
  const STEPS: Step[] = useMemo(() => {
    const followUp = paymentMethod === 'cash' ? CASH_STEPS : CARD_STEPS
    return [...BASE_STEPS, ...followUp, PHOTO_STEP]
  }, [paymentMethod])

  const {
    mutate,
    isPending: isLoading,
    isSuccess: hasSubmitted,
    error: mutationError,
    variables,
  } = useMutation({
    mutationFn: (data: ClaimFormData) => ClaimsRepository.submit(data),
  })

  const onSubmit = useCallback(
    // Radio/select values are always strings in the DOM — kioskBrand is a
    // numeric relationship ID server-side, so it must be coerced before send.
    (data: FormValues) =>
      mutate({ ...data, kioskBrand: Number(data.kioskBrand), machineId, photo }),
    [mutate, machineId, photo],
  )

  // GAListener only listens for clicks (see src/components/Analytics/GAListener.tsx).
  // A form success is async, so we dispatch a synthetic click on the success node
  // once it mounts — this keeps gtag() dispatch centralized in GAListener instead
  // of scattering ad-hoc calls across blocks.
  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.click()
    }
  }, [hasSubmitted])

  const goNext = useCallback(async () => {
    const current = STEPS[step]
    if (current.fields.length > 0) {
      const valid = await trigger(current.fields)
      if (!valid) return
    }
    setStep((s) => s + 1)
  }, [step, trigger, STEPS])

  const goBack = useCallback(() => setStep((s) => s - 1), [])

  const error = mutationError
    ? { message: (mutationError as Error).message || 'Something went wrong.' }
    : undefined

  if (hasSubmitted) {
    const submitted = (variables ?? {}) as Partial<ClaimFormData>
    return (
      <div className="ak-claim-form">
        <div
          ref={successRef}
          data-testid="claim-form-success"
          data-ga-event="claim_submit"
          data-ga-machine-id={submitted.machineId}
          className="ak-claim-form__success"
        >
          <p className="ak-claim-form__success-title">
            Thank you{submitted.customerName ? `, ${submitted.customerName}` : ''}!
          </p>
          <p className="ak-claim-form__success-copy">
            We will review the information provided and process the refund in the next 48 to 72
            hours.
          </p>
          <dl className="ak-claim-form__summary">
            {Object.entries(submitted)
              .filter(([key]) => FIELD_LABELS[key])
              .map(([key, value]) => (
                <div
                  key={key}
                  className="ak-claim-form__summary-row"
                >
                  <dt>{FIELD_LABELS[key]}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    )
  }

  if (step === -1) {
    return (
      <div className="ak-claim-form">
        <div className="ak-claim-form__intro">
          <h2 className="ak-claim-form__intro-title">Request a Refund</h2>
          <p className="ak-claim-form__intro-copy">
            Hi there, please fill out and submit this form to request a refund. This takes less than
            2 minutes — you'll get a copy of your submission by email.
          </p>
          <Button
            type="button"
            onClick={() => setStep(0)}
            className="bp-btn bp-btn--dark"
          >
            Start
          </Button>
        </div>
      </div>
    )
  }

  const current = STEPS[step]
  const isLastStep = step === STEPS.length - 1

  return (
    <div className="ak-claim-form">
      <p className="ak-claim-form__progress">
        {step + 1} of {STEPS.length}
      </p>

      {isLoading && <p className="ak-claim-form__loading">Loading, please wait...</p>}
      {error && (
        <div className="ak-claim-form__status ak-claim-form__status--error">{error.message}</div>
      )}

      <form
        onSubmit={isLastStep ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
        className="ak-claim-form__step"
      >
        {current.key === 'kioskBrand' && (
          <fieldset className="ak-claim-form__field">
            <legend>Kiosk Brand</legend>
            <div className="ak-claim-form__option-grid">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="ak-claim-form__option-card"
                >
                  <input
                    type="radio"
                    value={brand.id}
                    {...register('kioskBrand', { required: true })}
                  />
                  <span className="ak-claim-form__option-media">
                    <Image
                      src={brand.logoUrl || '/logos/logo-1.svg'}
                      alt=""
                      width={40}
                      height={40}
                    />
                  </span>
                  <span className="ak-claim-form__option-label">{brand.name}</span>
                </label>
              ))}
            </div>
            {errors.kioskBrand && <p className="ak-claim-form__error">This field is required.</p>}
          </fieldset>
        )}

        {current.key === 'paymentMethod' && (
          <fieldset className="ak-claim-form__field">
            <legend>Payment Method</legend>
            <div className="ak-claim-form__option-grid">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="ak-claim-form__option-card"
                >
                  <input
                    type="radio"
                    value={method.value}
                    {...register('paymentMethod', { required: true })}
                  />
                  <span className="ak-claim-form__option-media">{method.icon}</span>
                  <span className="ak-claim-form__option-label">{method.label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="ak-claim-form__error">This field is required.</p>
            )}
          </fieldset>
        )}

        {current.key === 'customerName' && (
          <div className="ak-claim-form__field">
            <label htmlFor="customerName">Name</label>
            <input
              id="customerName"
              {...register('customerName', { required: true })}
            />
            {errors.customerName && <p className="ak-claim-form__error">This field is required.</p>}
          </div>
        )}

        {current.key === 'customerEmail' && (
          <div className="ak-claim-form__field">
            <label htmlFor="customerEmail">Email</label>
            <input
              id="customerEmail"
              type="email"
              {...register('customerEmail', { required: true })}
            />
            {errors.customerEmail && (
              <p className="ak-claim-form__error">This field is required.</p>
            )}
          </div>
        )}

        {current.key === 'customerPhone' && (
          <div className="ak-claim-form__field">
            <label htmlFor="customerPhone">Phone Number</label>
            <input
              id="customerPhone"
              type="tel"
              inputMode="tel"
              {...register('customerPhone', { required: true })}
            />
            {errors.customerPhone && (
              <p className="ak-claim-form__error">This field is required.</p>
            )}
          </div>
        )}

        {current.key === 'transactionDateTime' && (
          <div className="ak-claim-form__field">
            <label htmlFor="transactionDateTime">Date and Time of the Transaction</label>
            <input
              id="transactionDateTime"
              type="datetime-local"
              {...register('transactionDateTime', { required: true })}
            />
          </div>
        )}

        {current.key === 'location' && (
          <>
            <p className="ak-claim-form__step-label">
              Where did the issue happen? (State, City, and Name of the property)
            </p>
            <div className="ak-claim-form__field">
              <label htmlFor="location.state">State</label>
              <input
                id="location.state"
                {...register('location.state', { required: true })}
              />
            </div>
            <div className="ak-claim-form__field">
              <label htmlFor="location.city">City</label>
              <input
                id="location.city"
                {...register('location.city', { required: true })}
              />
            </div>
            <div className="ak-claim-form__field">
              <label htmlFor="location.propertyName">Property Name</label>
              <input
                id="location.propertyName"
                {...register('location.propertyName', { required: true })}
              />
            </div>
          </>
        )}

        {current.key === 'claimReason' && (
          <div className="ak-claim-form__field">
            <label htmlFor="claimReason">What happened?</label>
            <select
              id="claimReason"
              {...register('claimReason', { required: true })}
            >
              <option value="" />
              {CLAIM_REASONS.map((reason) => (
                <option
                  key={reason.value}
                  value={reason.value}
                >
                  {reason.label}
                </option>
              ))}
            </select>
            {errors.claimReason && <p className="ak-claim-form__error">This field is required.</p>}
          </div>
        )}

        {current.key === 'additionalInfo' && (
          <div className="ak-claim-form__field">
            <label htmlFor="additionalInfo">Additional Information (optional)</label>
            <p className="ak-claim-form__step-label">
              What products were you trying to purchase? Did the machine show any messages on the
              screen?
            </p>
            <textarea
              id="additionalInfo"
              {...register('additionalInfo')}
            />
          </div>
        )}

        {current.key === 'lastFourCardDigits' && (
          <div className="ak-claim-form__field">
            <label htmlFor="lastFourCardDigits">Last 4 digits of the card used</label>
            <input
              id="lastFourCardDigits"
              maxLength={4}
              {...register('lastFourCardDigits')}
            />
          </div>
        )}

        {current.key === 'refundMethod' && (
          <div className="ak-claim-form__field">
            <label htmlFor="refundMethod">Select a refund method</label>
            <select
              id="refundMethod"
              {...register('refundMethod', { required: true })}
            >
              <option value="" />
              {REFUND_METHODS.map((method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ))}
            </select>
            {errors.refundMethod && <p className="ak-claim-form__error">This field is required.</p>}
          </div>
        )}

        {current.key === 'refundAccount' && (
          <div className="ak-claim-form__field">
            <label htmlFor="refundAccount">
              Username/email/phone associated with your refund account
            </label>
            <input
              id="refundAccount"
              {...register('refundAccount', { required: true })}
            />
            {errors.refundAccount && (
              <p className="ak-claim-form__error">This field is required.</p>
            )}
          </div>
        )}

        {current.key === 'photo' && (
          <div className="ak-claim-form__field">
            <label htmlFor="photo">Attach a picture of the issue (optional)</label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && file.size > 8 * 1024 * 1024) {
                  setPhotoError('Photo exceeds the 8MB size limit.')
                  setPhoto(undefined)
                  e.target.value = ''
                  return
                }
                setPhotoError(undefined)
                setPhoto(file)
              }}
            />
            {photoError && <p className="ak-claim-form__error">{photoError}</p>}
          </div>
        )}

        <div className="ak-claim-form__actions">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
            >
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button
              type="submit"
              className="bp-btn bp-btn--dark"
            >
              {submitButtonLabel}
            </Button>
          ) : (
            <Button
              type="button"
              className="bp-btn bp-btn--dark"
              onClick={goNext}
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

'use client'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Path } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { ClaimsRepository } from '@/repositories'
import type { ClaimFormData } from '@/repositories/ClaimsRepository'
import './styles.css'

export type ClaimFormBlockType = {
  blockName?: string
  blockType?: 'claimForm'
  introContent?: DefaultTypedEditorState
  creditsAvailableYesMessage?: string
  creditsAvailableNoMessage?: string
  additionalInfoHint?: string
  submitButtonLabel?: string
}

type Brand = { id: number | string; name: string; logoUrl?: string }
// sawCreditsAvailable is UI-only branching state (JotForm's qid 4 "Did you
// see credits available?", cash-only) — never sent to the backend, stripped
// out in onSubmit before calling ClaimsRepository.submit.
type FormValues = Omit<ClaimFormData, 'machineId' | 'photo'> & {
  sawCreditsAvailable?: 'yes' | 'no'
}

// Fixes the JotForm bug found in the live-site audit: the confirmation email
// showed "Type a question" for 5 of 11 fields instead of the real label.
const FIELD_LABELS: Record<string, string> = {
  kioskBrand: 'Kiosk Brand',
  paymentMethod: 'Payment Method',
  customerFirstName: 'First Name',
  customerLastName: 'Last Name',
  customerEmail: 'Email',
  customerPhone: 'Phone Number',
  transactionDateTime: 'Date and Time of the Transaction',
  location: 'Location',
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
    // simple-icons "googlepay" glyph (MIT) — Material Symbols has no brand
    // logos, so this brand mark is rendered standalone, matching the
    // WhatsApp icon in SupportHub.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M3.963 7.235A3.963 3.963 0 00.422 9.419a3.963 3.963 0 000 3.559 3.963 3.963 0 003.541 2.184c1.07 0 1.97-.352 2.627-.957.748-.69 1.18-1.71 1.18-2.916a4.722 4.722 0 00-.07-.806H3.964v1.526h2.14a1.835 1.835 0 01-.79 1.205c-.356.241-.814.379-1.35.379-1.034 0-1.911-.697-2.225-1.636a2.375 2.375 0 010-1.517c.314-.94 1.191-1.636 2.225-1.636a2.152 2.152 0 011.52.594l1.132-1.13a3.808 3.808 0 00-2.652-1.033zm6.501.55v6.9h.886V11.89h1.465c.603 0 1.11-.196 1.522-.588a1.911 1.911 0 00.635-1.464 1.92 1.92 0 00-.635-1.456 2.125 2.125 0 00-1.522-.598zm2.427.85a1.156 1.156 0 01.823.365 1.176 1.176 0 010 1.686 1.171 1.171 0 01-.877.357H11.35V8.635h1.487a1.156 1.156 0 01.054 0zm4.124 1.175c-.842 0-1.477.308-1.907.925l.781.491c.288-.417.68-.626 1.175-.626a1.255 1.255 0 01.856.323 1.009 1.009 0 01.366.785v.202c-.34-.193-.774-.289-1.3-.289-.617 0-1.11.145-1.479.434-.37.288-.554.677-.554 1.165a1.476 1.476 0 00.525 1.156c.35.308.785.463 1.305.463.61 0 1.098-.27 1.465-.81h.038v.655h.848v-2.909c0-.61-.19-1.09-.568-1.44-.38-.35-.896-.525-1.551-.525zm2.263.154l1.946 4.422-1.098 2.38h.915L24 9.963h-.965l-1.368 3.391h-.02l-1.406-3.39zm-2.146 2.368c.494 0 .88.11 1.156.33 0 .372-.147.696-.44.973a1.413 1.413 0 01-.997.414 1.081 1.081 0 01-.69-.232.708.708 0 01-.293-.578c0-.257.12-.47.363-.647.24-.173.54-.26.9-.26Z" />
      </svg>
    ),
  },
  {
    value: 'apple_pay',
    label: 'Apple Pay',
    // simple-icons "applepay" glyph (MIT), same rationale as Google Pay above.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M2.15 4.318a42.16 42.16 0 0 0-.454.003c-.15.005-.303.013-.452.04a1.44 1.44 0 0 0-1.06.772c-.07.138-.114.278-.14.43-.028.148-.037.3-.04.45A10.2 10.2 0 0 0 0 6.222v11.557c0 .07.002.138.003.207.004.15.013.303.04.452.027.15.072.291.142.429a1.436 1.436 0 0 0 .63.63c.138.07.278.115.43.142.148.027.3.036.45.04l.208.003h20.194l.207-.003c.15-.004.303-.013.452-.04.15-.027.291-.071.428-.141a1.432 1.432 0 0 0 .631-.631c.07-.138.115-.278.141-.43.027-.148.036-.3.04-.45.002-.07.003-.138.003-.208l.001-.246V6.221c0-.07-.002-.138-.004-.207a2.995 2.995 0 0 0-.04-.452 1.446 1.446 0 0 0-1.2-1.201a3.022 3.022 0 0 0-.452-.04a10.448 10.448 0 0 0-.453-.003zm0 .512h19.942c.066 0 .131.002.197.003.115.004.25.01.375.032.109.02.2.05.287.094a.927.927 0 0 1 .407.407.997.997 0 0 1 .094.288c.022.123.028.258.031.374.002.065.003.13.003.197v11.552c0 .065 0 .13-.003.196-.003.115-.009.25-.032.375a.927.927 0 0 1-.5.693a1.002 1.002 0 0 1-.286.094a2.598 2.598 0 0 1-.373.032l-.2.003H1.906c-.066 0-.133-.002-.196-.003a2.61 2.61 0 0 1-.375-.032c-.109-.02-.2-.05-.288-.094a.918.918 0 0 1-.406-.407a1.006 1.006 0 0 1-.094-.288a2.531 2.531 0 0 1-.032-.373a9.588 9.588 0 0 1-.002-.197V6.224c0-.065 0-.131.002-.197.004-.114.01-.248.032-.375.02-.108.05-.199.094-.287a.925.925 0 0 1 .407-.406a1.03 1.03 0 0 1 .287-.094c.125-.022.26-.029.375-.032.065-.002.131-.002.196-.003zm4.71 3.7c-.3.016-.668.199-.88.456c-.191.22-.36.58-.316.918.338.03.675-.169.888-.418.205-.258.345-.603.308-.955zm2.207.42v5.493h.852v-1.877h1.18c1.078 0 1.835-.739 1.835-1.812c0-1.07-.742-1.805-1.808-1.805zm.852.719h.982c.739 0 1.161.396 1.161 1.089c0 .692-.422 1.092-1.164 1.092h-.979zm-3.154.3c-.45.01-.83.28-1.05.28c-.235 0-.593-.264-.981-.257a1.446 1.446 0 0 0-1.23.747c-.527.908-.139 2.255.374 2.995c.249.366.549.769.944.754c.373-.014.52-.242.973-.242c.454 0 .586.242.98.235c.41-.007.667-.366.915-.733c.286-.417.403-.82.41-.841c-.007-.008-.79-.308-.797-1.209c-.008-.754.615-1.113.644-1.135c-.352-.52-.9-.578-1.09-.593a1.123 1.123 0 0 0-.092-.002zm8.204.397c-.99 0-1.606.533-1.652 1.256h.777c.072-.358.369-.586.845-.586c.502 0 .803.266.803.711v.309l-1.097.064c-.951.054-1.488.484-1.488 1.184c0 .72.548 1.207 1.332 1.207c.526 0 1.032-.281 1.264-.727h.019v.659h.788v-2.76c0-.803-.62-1.317-1.591-1.317zm1.94.072l1.446 4.009c0 .003-.073.24-.073.247c-.125.41-.33.571-.711.571c-.069 0-.206 0-.267-.015v.666c.06.011.267.019.335.019c.83 0 1.226-.312 1.568-1.283l1.5-4.214h-.868l-1.012 3.259h-.015l-1.013-3.26zm-1.167 2.189v.316c0 .521-.45.917-1.024.917c-.442 0-.731-.228-.731-.579c0-.342.278-.56.769-.593z" />
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
// refund method" option text verbatim. Icons are simple-icons brand glyphs
// (MIT), same rationale as the WhatsApp/Google Pay/Apple Pay icons above —
// Material Symbols has no brand logos.
const REFUND_METHODS = [
  {
    value: 'Zelle',
    label: 'Zelle',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-2.765H5.638a.667.667 0 0 1-.666-.666v-2.234a.67.67 0 0 1 .142-.412l8.139-10.382h-7.25a.667.667 0 0 1-.667-.667V3.914c0-.367.299-.666.666-.666h4.23V.483c0-.266.217-.483.483-.483h2.841c.266 0 .483.217.483.483v2.765h4.323c.367 0 .666.299.666.666v2.137a.67.67 0 0 1-.141.41l-8.19 10.481h7.665c.367 0 .666.299.666.666v2.477a.667.667 0 0 1-.666.667h-4.32v2.765a.483.483 0 0 1-.483.483Z" />
      </svg>
    ),
  },
  {
    value: 'CashApp',
    label: 'CashApp',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.59 3.475a5.1 5.1 0 00-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 00-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 003.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 003.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63l-.93.93a.5.5 0 01-.67.01 5 5 0 00-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 01-.48.39H9.63l-.09-.01a.5.5 0 01-.38-.59l.28-1.27a6.54 6.54 0 01-2.88-1.57v-.01a.48.48 0 010-.68l1-.97a.49.49 0 01.67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 01.48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z" />
      </svg>
    ),
  },
  {
    value: 'Paypal',
    label: 'PayPal',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
      </svg>
    ),
  },
  {
    value: 'Venmo',
    label: 'Venmo',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M21.772 13.119c-.267 0-.381-.251-.38-.655 0-.533.121-1.575.712-1.575.267 0 .357.243.357.598 0 .533-.13 1.632-.689 1.632Zm.502-3.377c-1.677 0-2.405 1.285-2.405 2.658 0 1.042.421 1.874 1.693 1.874 1.717 0 2.438-1.406 2.438-2.763 0-1.025-.462-1.769-1.726-1.769Zm-3.833 0c-.558 0-.964.17-1.393.477-.154-.275-.462-.477-.932-.477-.542 0-.947.219-1.247.437l-.04-.364H13.54l-.688 4.354h1.506l.479-3.053c.129-.065.323-.154.518-.154.145 0 .267.049.267.267 0 .056-.016.145-.024.218l-.429 2.722h1.498l.478-3.053c.138-.073.324-.154.51-.154.146 0 .268.049.268.267 0 .056-.017.145-.025.218l-.429 2.722h1.499l.461-2.908c.025-.153.049-.388.049-.549 0-.582-.267-.97-1.037-.97Zm-6.871 0c-.575 0-.98.219-1.287.421l-.017-.348H8.962l-.689 4.354H9.78l.478-3.053c.13-.065.324-.154.518-.154.147 0 .268.049.268.242 0 .081-.024.227-.032.299l-.422 2.666h1.499l.462-2.908c.024-.153.049-.388.049-.549 0-.582-.268-.97-1.03-.97Zm-5.631 1.834c.041-.485.413-.824.697-.824.162 0 .299.097.299.291 0 .404-.713.533-.996.533Zm.843-1.834c-1.604 0-2.382 1.39-2.382 2.698 0 1.01.478 1.817 1.814 1.817.527 0 1.07-.113 1.418-.282l.186-1.26c-.494.25-.874.347-1.271.347-.365 0-.64-.194-.64-.687.826-.008 2.252-.347 2.252-1.453 0-.687-.494-1.18-1.377-1.18Zm-4.239.267c.089.186.146.412.146.743 0 .606-.429 1.494-.777 2.06l-.373-2.989L0 9.969l.705 4.2h1.757c.77-1.01 1.718-2.448 1.718-3.554 0-.347-.073-.622-.235-.889l-1.402.283Z" />
      </svg>
    ),
  },
]

const nowForDateTimeLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

// Formats as the user types into "(555) 555-5555", stripping everything but
// digits and capping at 10 — matches the US phone format the refund team
// expects (this form is US-kiosk-only, see JotFormRepository's 5_full mapping).
// Browser autofill often includes the leading US country code (+1), giving 11
// digits — drop it before slicing, or the first 10 digits kept would be the
// "1" plus the first 9 of the real number instead of the actual area code.
const formatUSPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }
  digits = digits.slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/

const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic'

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type Step = { key: string; fields: Path<FormValues>[]; required: boolean }

const BEFORE_CREDIT_CHECK_STEPS: Step[] = [
  { key: 'kioskBrand', fields: ['kioskBrand'], required: true },
  { key: 'paymentMethod', fields: ['paymentMethod'], required: true },
]

// Cash-only sub-flow mirroring JotForm qid 4 ("Did you see credits
// available?") and its Yes/No branch messages (qid 6 vs qid 5). Yes means the
// machine still shows the credit — nothing to refund yet, so the flow ends on
// that message instead of continuing to collect contact info. No means the
// credit is gone — apologize and continue into the regular refund form.
// Editable from the block's admin fields (creditsAvailableYesMessage/
// creditsAvailableNoMessage) — these are just the fallback defaults.
const DEFAULT_CREDITS_AVAILABLE_YES_MESSAGE =
  'Great! Please press "change" to receive a refund, or select a product and click "Place Order" to continue with the transaction.'
const DEFAULT_CREDITS_AVAILABLE_NO_MESSAGE =
  'We are sorry to hear that. Please continue to provide us with your personal information so our team can issue a refund.'
const DEFAULT_ADDITIONAL_INFO_HINT =
  'Please provide details on the issue. What products were you trying to purchase? Did the machine show any messages on the screen? This feedback is optional and it helps us to improve our service.'

const CASH_CREDIT_CHECK_STEPS: Step[] = [
  { key: 'sawCreditsAvailable', fields: ['sawCreditsAvailable'], required: true },
  { key: 'creditsAvailableMessage', fields: [], required: false },
]

const AFTER_CREDIT_CHECK_STEPS: Step[] = [
  {
    key: 'contactInfo',
    fields: ['customerFirstName', 'customerLastName', 'customerEmail'],
    required: true,
  },
  { key: 'customerPhone', fields: ['customerPhone'], required: true },
  { key: 'transactionDateTime', fields: ['transactionDateTime'], required: true },
  { key: 'location', fields: ['location'], required: true },
  { key: 'claimReason', fields: ['claimReason'], required: true },
  { key: 'additionalInfo', fields: ['additionalInfo'], required: false },
]

// Card refunds go back to the card automatically (card + digits step); cash
// refunds need a destination account instead (refundMethod + refundAccount) —
// mirrors the branching audited on the live JotForm (qid 18/20/21), condensed
// into two straightforward extra steps instead of cloning its image+yes/no flow.
const CARD_STEPS: Step[] = [
  { key: 'lastFourCardDigits', fields: ['lastFourCardDigits'], required: true },
]
const CASH_STEPS: Step[] = [
  { key: 'refundMethod', fields: ['refundMethod'], required: true },
  { key: 'refundAccount', fields: ['refundAccount'], required: true },
]
const PHOTO_STEP: Step = { key: 'photo', fields: [], required: false }
const CONFIRM_STEP: Step = { key: 'confirm', fields: [], required: false }

export const ClaimFormBlock: React.FC<{ id?: string; brands: Brand[] } & ClaimFormBlockType> = ({
  brands,
  introContent,
  creditsAvailableYesMessage = DEFAULT_CREDITS_AVAILABLE_YES_MESSAGE,
  creditsAvailableNoMessage = DEFAULT_CREDITS_AVAILABLE_NO_MESSAGE,
  additionalInfoHint = DEFAULT_ADDITIONAL_INFO_HINT,
  submitButtonLabel = 'Submit claim',
}) => {
  const searchParams = useSearchParams()
  const machineId = searchParams?.get('machine_id') ?? undefined
  const successRef = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState<File | undefined>(undefined)
  const [photoError, setPhotoError] = useState<string | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)

  // step -1 = intro screen, 0..STEPS.length-1 = one field group per screen
  // (mirrors the 11-screen flow audited on Amerikiosks' current JotForm).
  const [step, setStep] = useState(-1)

  const {
    register,
    trigger,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { transactionDateTime: nowForDateTimeLocal() },
  })

  const paymentMethod = watch('paymentMethod')
  const sawCreditsAvailable = watch('sawCreditsAvailable')
  const refundMethod = watch('refundMethod')
  const allValues = watch()

  // Branches only once a payment method is actually chosen (paymentMethod is ''
  // pre-selection) — card vs. cash follow-up steps, plus the optional photo step
  // shared by both, appended after the base flow. Cash also gets the
  // sawCreditsAvailable/creditsAvailableMessage pair spliced in right after
  // paymentMethod, before the contact-info steps.
  const STEPS: Step[] = useMemo(() => {
    const creditCheck = paymentMethod === 'cash' ? CASH_CREDIT_CHECK_STEPS : []
    const followUp = paymentMethod === 'cash' ? CASH_STEPS : CARD_STEPS
    return [
      ...BEFORE_CREDIT_CHECK_STEPS,
      ...creditCheck,
      ...AFTER_CREDIT_CHECK_STEPS,
      ...followUp,
      PHOTO_STEP,
      CONFIRM_STEP,
    ]
  }, [paymentMethod])

  // Yes means the credit is still on the machine — nothing to refund, the
  // flow ends on the creditsAvailableMessage screen with no forward action.
  const isCreditsAvailableTerminal =
    STEPS[step]?.key === 'creditsAvailableMessage' && sawCreditsAvailable === 'yes'

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
    // sawCreditsAvailable is UI-only branching state, never sent.
    ({ sawCreditsAvailable: _sawCreditsAvailable, ...data }: FormValues) =>
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

  const acceptPhoto = useCallback((file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Photo exceeds the 8MB size limit.')
      setPhoto(undefined)
      return
    }
    setPhotoError(undefined)
    setPhoto(file)
  }, [])

  // Single-click selection steps (kioskBrand, paymentMethod,
  // sawCreditsAvailable) advance immediately on choice instead of requiring a
  // separate Next click — Next stays required only for typed-input steps.
  // Uses onClick (not onChange) because a radio's native "change" event only
  // fires when the checked value actually differs — re-clicking the option
  // you're already on (e.g. after Previous) wouldn't fire it. onClick always
  // fires, and by the time it runs the browser has already applied the new
  // checked state, so goNext()'s trigger() reads the right value.
  const registerAndAdvance = useCallback(
    (name: Path<FormValues>) => ({
      ...register(name, { required: true }),
      onClick: () => goNext(),
    }),
    [register, goNext],
  )

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
            Thank you{submitted.customerFirstName ? `, ${submitted.customerFirstName}` : ''}!
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
          {introContent && (
            <RichText
              className="ak-claim-form__intro-content"
              data={introContent}
              enableGutter={false}
            />
          )}
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
  const isAutoAdvanceStep = [
    'kioskBrand',
    'paymentMethod',
    'sawCreditsAvailable',
    'refundMethod',
  ].includes(current.key)

  return (
    <div className="ak-claim-form">
      <div
        className="ak-claim-form__progress"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${step + 1} of ${STEPS.length}`}
      >
        <div
          className="ak-claim-form__progress-track"
          data-testid="claim-form-progress-track"
        >
          <div
            className="ak-claim-form__progress-fill"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="ak-claim-form__progress-label">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {isLoading && <p className="ak-claim-form__loading">Loading, please wait...</p>}
      {error && (
        <div className="ak-claim-form__status ak-claim-form__status--error">{error.message}</div>
      )}

      <form
        onSubmit={isLastStep ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
        className="ak-claim-form__step"
      >
        <div className="ak-claim-form__main">
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
                      {...registerAndAdvance('kioskBrand')}
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
                      {...registerAndAdvance('paymentMethod')}
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

          {current.key === 'sawCreditsAvailable' && (
            <fieldset className="ak-claim-form__field ak-claim-form__field--question">
              <div className="ak-claim-form__reference-image">
                <Image
                  src="/claim-form/credits-available-reference.png"
                  alt="Kiosk screen showing the available credit indicator"
                  fill
                  sizes="(max-width: 640px) 90vw, 32rem"
                />
              </div>
              <legend>Did you see credits available?</legend>
              <div className="ak-claim-form__option-grid">
                <label className="ak-claim-form__option-card">
                  <input
                    type="radio"
                    value="yes"
                    {...registerAndAdvance('sawCreditsAvailable')}
                  />
                  <span className="ak-claim-form__option-label">Yes</span>
                </label>
                <label className="ak-claim-form__option-card">
                  <input
                    type="radio"
                    value="no"
                    {...registerAndAdvance('sawCreditsAvailable')}
                  />
                  <span className="ak-claim-form__option-label">No</span>
                </label>
              </div>
              {errors.sawCreditsAvailable && (
                <p className="ak-claim-form__error">This field is required.</p>
              )}
            </fieldset>
          )}

          {current.key === 'creditsAvailableMessage' && (
            <p className="ak-claim-form__step-label">
              {sawCreditsAvailable === 'yes'
                ? creditsAvailableYesMessage
                : creditsAvailableNoMessage}
            </p>
          )}

          {current.key === 'contactInfo' && (
            <>
              <div className="ak-claim-form__field-row">
                <div className="ak-claim-form__field">
                  <label htmlFor="customerFirstName">First Name</label>
                  <input
                    id="customerFirstName"
                    autoComplete="given-name"
                    {...register('customerFirstName', { required: true })}
                  />
                  {errors.customerFirstName && (
                    <p className="ak-claim-form__error">This field is required.</p>
                  )}
                </div>

                <div className="ak-claim-form__field">
                  <label htmlFor="customerLastName">Last Name</label>
                  <input
                    id="customerLastName"
                    autoComplete="family-name"
                    {...register('customerLastName', { required: true })}
                  />
                  {errors.customerLastName && (
                    <p className="ak-claim-form__error">This field is required.</p>
                  )}
                </div>
              </div>

              <div className="ak-claim-form__field">
                <label htmlFor="customerEmail">Email</label>
                <input
                  id="customerEmail"
                  type="email"
                  autoComplete="email"
                  {...register('customerEmail', { required: true })}
                />
                {errors.customerEmail && (
                  <p className="ak-claim-form__error">This field is required.</p>
                )}
              </div>
            </>
          )}

          {current.key === 'customerPhone' && (
            <div className="ak-claim-form__field">
              <label htmlFor="customerPhone">Phone Number</label>
              <input
                id="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 555-5555"
                {...register('customerPhone', {
                  required: true,
                  pattern: US_PHONE_PATTERN,
                })}
                onChange={(e) => {
                  const formatted = formatUSPhone(e.target.value)
                  e.target.value = formatted
                  setValue('customerPhone', formatted, { shouldValidate: true })
                }}
              />
              {errors.customerPhone && (
                <p className="ak-claim-form__error">
                  {errors.customerPhone.type === 'pattern'
                    ? 'Enter a valid US phone number.'
                    : 'This field is required.'}
                </p>
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
            <div className="ak-claim-form__field">
              <label htmlFor="location">Where did the issue happen?</label>
              <p className="ak-claim-form__step-label">
                Give us a reference — include the state, city, and name of the property.
              </p>
              <input
                id="location"
                {...register('location', { required: true })}
              />
              {errors.location && <p className="ak-claim-form__error">This field is required.</p>}
            </div>
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
              {errors.claimReason && (
                <p className="ak-claim-form__error">This field is required.</p>
              )}
            </div>
          )}

          {current.key === 'additionalInfo' && (
            <div className="ak-claim-form__field">
              <label htmlFor="additionalInfo">Additional Information (optional)</label>
              <p className="ak-claim-form__step-label">{additionalInfoHint}</p>
              <textarea
                id="additionalInfo"
                {...register('additionalInfo')}
              />
            </div>
          )}

          {current.key === 'lastFourCardDigits' && (
            <div className="ak-claim-form__field">
              <label htmlFor="lastFourCardDigits">
                Please provide the last 4 digits associated with your{' '}
                {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label || 'payment method'}{' '}
                account.
              </label>
              <input
                id="lastFourCardDigits"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                {...register('lastFourCardDigits', { required: true })}
              />
              {errors.lastFourCardDigits && (
                <p className="ak-claim-form__error">This field is required.</p>
              )}
            </div>
          )}

          {current.key === 'refundMethod' && (
            <fieldset className="ak-claim-form__field">
              <legend>Select a refund method</legend>
              <div className="ak-claim-form__option-grid">
                {REFUND_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className="ak-claim-form__option-card"
                  >
                    <input
                      type="radio"
                      value={method.value}
                      {...registerAndAdvance('refundMethod')}
                    />
                    <span className="ak-claim-form__option-media">{method.icon}</span>
                    <span className="ak-claim-form__option-label">{method.label}</span>
                  </label>
                ))}
              </div>
              {errors.refundMethod && (
                <p className="ak-claim-form__error">This field is required.</p>
              )}
            </fieldset>
          )}

          {current.key === 'refundAccount' && (
            <div className="ak-claim-form__field">
              <label htmlFor="refundAccount">
                Please provide the username/email/phone associated with your{' '}
                {refundMethod || 'refund method'} account.
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
            <div className="ak-claim-form__field bp-file-upload">
              <span className="ak-claim-form__field-label">
                Attach a picture of the issue (optional)
              </span>
              <label
                className="bp-file-upload__dropzone"
                htmlFor="photo"
                data-dragover={isDragOver || undefined}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  acceptPhoto(e.dataTransfer.files?.[0])
                }}
              >
                <input
                  className="bp-file-upload__input"
                  id="photo"
                  type="file"
                  accept={PHOTO_ACCEPT}
                  onChange={(e) => acceptPhoto(e.target.files?.[0])}
                />
                <span
                  className="bp-file-upload__icon"
                  aria-hidden="true"
                >
                  ⬆
                </span>
                <span className="bp-file-upload__copy">
                  Drag a photo here or <span className="bp-file-upload__browse">browse</span>
                </span>
              </label>
              {(photo || photoError) && (
                <ul className="bp-file-upload__list">
                  {photo && !photoError && (
                    <li
                      className="bp-file-upload__item"
                      data-state="success"
                    >
                      <span className="bp-file-upload__name">{photo.name}</span>
                      <span className="bp-file-upload__size">{formatFileSize(photo.size)}</span>
                    </li>
                  )}
                  {photoError && (
                    <li
                      className="bp-file-upload__item"
                      data-state="error"
                    >
                      <span className="bp-file-upload__name">{photoError}</span>
                      <button
                        className="bp-file-upload__retry"
                        type="button"
                        onClick={() => setPhotoError(undefined)}
                      >
                        Dismiss
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {current.key === 'confirm' && (
            <div className="ak-claim-form__field">
              <p className="ak-claim-form__step-label">
                Please review your information before submitting.
              </p>
              <dl className="ak-claim-form__summary">
                {Object.entries(allValues)
                  .filter(([key, value]) => FIELD_LABELS[key] && value)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="ak-claim-form__summary-row"
                    >
                      <dt>{FIELD_LABELS[key]}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                {photo && (
                  <div className="ak-claim-form__summary-row">
                    <dt>Photo</dt>
                    <dd>{photo.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="ak-claim-form__actions">
          {step >= 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
            >
              Previous
            </Button>
          )}
          {isCreditsAvailableTerminal || isAutoAdvanceStep ? null : isLastStep ? (
            <Button
              key="submit"
              type="submit"
              className="bp-btn bp-btn--dark"
            >
              {submitButtonLabel}
            </Button>
          ) : (
            <Button
              key="next"
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

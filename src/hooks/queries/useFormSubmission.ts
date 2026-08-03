'use client'

import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { FormsRepository } from '@/repositories'

type Gtag = (
  command: 'event',
  eventName: string,
  params: { form_name?: string; locale?: string },
) => void

type UseFormSubmissionArgs = {
  formID: string
  /** Names the form declares. Anything else is dropped before sending. */
  declaredFields: string[]
  requiresConsent?: boolean
  confirmationType?: 'message' | 'redirect' | null
  redirectUrl?: string | null
  /** Sent to GA as `form_name`. The internal title, not the localized heading. */
  title?: string | null
  honeypotRef: React.RefObject<HTMLInputElement | null>
  renderedAtRef: React.RefObject<number>
  turnstile: { token?: string; reset: () => void }
}

/**
 * The network half of a form submission, kept out of the component.
 *
 * This is layer 4 of the repository pattern the org follows — components talk
 * to a query hook, the hook talks to a repository, and only the repository
 * knows about `fetch`. FormBlock was doing all three at once in ~600 lines that
 * also handle validation, Turnstile, upload progress and rendering, so every
 * test of the markup had to stub the network too.
 */
export function useFormSubmission({
  formID,
  declaredFields,
  requiresConsent,
  confirmationType,
  redirectUrl,
  title,
  honeypotRef,
  renderedAtRef,
  turnstile,
}: UseFormSubmissionArgs) {
  // Only meaningful while a submission carrying a file is in flight; the Upload
  // field renders its own bar from it.
  const [uploadPercent, setUploadPercent] = useState<number | undefined>(undefined)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: FormFieldBlock[]) => {
      // `useForm({ defaultValues: form.fields })` seeds the form state from the
      // fields *array*, so `data` also carries its numeric indices ("0", "1", …)
      // whose values are whole field-config objects. Payload's own endpoint
      // ignored those; our route validates what it is given and rejects
      // anything the form does not declare, which turned every real submission
      // into a 400. Send only the declared fields.
      const declared = new Set(declaredFields)
      if (requiresConsent) declared.add('consent')

      const submissionData = Object.entries(data)
        .filter(([field]) => declared.has(field))
        .map(([field, value]) => ({ field, value }))
      const hasFile = submissionData.some((entry) => entry.value instanceof File)
      if (hasFile) setUploadPercent(0)

      return FormsRepository.submit(
        {
          form: formID,
          submissionData,
          honeypot: honeypotRef.current?.value || undefined,
          renderedAt: renderedAtRef.current,
          turnstileToken: turnstile.token,
        },
        hasFile ? setUploadPercent : undefined,
      )
    },
    onSuccess: () => {
      if (confirmationType === 'redirect' && redirectUrl) {
        // The success node (which carries data-ga-event) never renders for
        // redirect confirmations, so without this the lead goes untracked.
        const g = (window as Window & { gtag?: Gtag }).gtag
        if (typeof g === 'function') {
          g('event', 'generate_lead', {
            form_name: title ?? undefined,
            locale: document.documentElement.lang || undefined,
          })
        }
        router.push(redirectUrl)
      }
    },
    onSettled: () => setUploadPercent(undefined),
    onError: (err) => {
      // The visitor gets a sentence on screen; the technical detail belongs in
      // the console (this used to render as "500: Not Found").
      console.error('[form] submission failed:', err)
      turnstile.reset()
    },
  })

  const { mutate, reset } = mutation
  const retry = useCallback(
    (data: FormFieldBlock[] | undefined) => {
      reset()
      if (data) mutate(data)
    },
    [mutate, reset],
  )

  return {
    submit: mutate,
    retry,
    isLoading: mutation.isPending,
    hasSubmitted: mutation.isSuccess,
    error: mutation.error,
    uploadPercent,
  }
}

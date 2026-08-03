'use client'

import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { ClaimsRepository } from '@/repositories'
import type { ClaimFormData } from '@/repositories/ClaimsRepository'

/**
 * UI-only branching state, from the legacy JotForm's "Did you see credits
 * available?" (cash only). It steers which step comes next and is never sent.
 */
export type ClaimFormValues = Omit<ClaimFormData, 'machineId' | 'photo'> & {
  sawCreditsAvailable?: 'yes' | 'no'
}

/**
 * The network half of a refund claim, and the payload shaping that goes with it.
 *
 * Layer 4 of the repository pattern: the component talks to this, this talks to
 * ClaimsRepository, and only the repository knows about fetch. The mutation
 * itself is thin — what is worth having out of the component is the transform,
 * which has two rules that are easy to get wrong and impossible to see from the
 * markup.
 */
export function useClaimSubmission({
  machineId,
  photo,
}: {
  /** From the ?machine_id= a kiosk QR code carries. */
  machineId?: string
  photo?: File
}) {
  const mutation = useMutation({
    mutationFn: (data: ClaimFormData) => ClaimsRepository.submit(data),
  })

  const { mutate } = mutation
  const submit = useCallback(
    ({ sawCreditsAvailable: _uiOnly, ...data }: ClaimFormValues) =>
      mutate({
        ...data,
        // Radio and select values are always strings in the DOM, but kioskBrand
        // is a numeric relationship id server-side.
        kioskBrand: Number(data.kioskBrand),
        machineId,
        photo,
      }),
    [mutate, machineId, photo],
  )

  return {
    submit,
    isLoading: mutation.isPending,
    hasSubmitted: mutation.isSuccess,
    error: mutation.error,
    /** What was actually sent — the confirmation screen echoes it back. */
    submitted: (mutation.variables ?? {}) as Partial<ClaimFormData>,
  }
}

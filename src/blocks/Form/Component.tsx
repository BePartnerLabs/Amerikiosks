'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import RichText from '@/components/RichText'
import { FormsRepository } from '@/repositories'
import { fields } from './fields'
import './styles.css'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
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
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const router = useRouter()

  const {
    mutate,
    isPending: isLoading,
    isSuccess: hasSubmitted,
    error: mutationError,
  } = useMutation({
    mutationFn: (data: FormFieldBlock[]) => {
      const submissionData = Object.entries(data).map(([field, value]) => ({ field, value }))
      return FormsRepository.submit({ form: formID ?? '', submissionData })
    },
    onSuccess: () => {
      if (confirmationType === 'redirect' && redirect?.url) {
        router.push(redirect.url)
      }
    },
  })

  const error = mutationError
    ? { message: (mutationError as Error).message || 'Something went wrong.' }
    : undefined

  const onSubmit = useCallback((data: FormFieldBlock[]) => mutate(data), [mutate])

  // GAListener only listens for clicks, so an async form success (no click
  // of its own) needs a synthetic one on mount to dispatch generate_lead —
  // same pattern as ClaimForm's success node.
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.click()
    }
  }, [hasSubmitted])

  return (
    <div className="ak-form">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText
          className="ak-form__intro"
          data={introContent}
          enableGutter={false}
        />
      )}
      <div className="ak-form__card">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <div
              ref={successRef}
              data-testid="form-block-success"
              data-ga-event="generate_lead"
              data-ga-form-name={title}
            >
              <RichText data={confirmationMessage} />
            </div>
          )}
          {isLoading && !hasSubmitted && (
            <p className="ak-form__loading">Loading, please wait...</p>
          )}
          {error && (
            <div className="ak-form__status ak-form__status--error">
              {`500: ${error.message || ''}`}
            </div>
          )}
          {!hasSubmitted && (
            <form
              id={formID}
              onSubmit={handleSubmit(onSubmit)}
            >
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
                      />
                    )
                  }
                  return null
                })}
              </div>

              <button
                className="bp-btn bp-btn--dark ak-form__submit"
                form={formID}
                type="submit"
              >
                {submitButtonLabel}
              </button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}

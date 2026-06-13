'use client'

import type React from 'react'
import { useForm } from 'react-hook-form'

type FormValues = {
  brandName: string
  workEmail: string
  productCategory: string
  targetVenues: string
  desiredTimeline: string
  placementGoal: string
  message: string
}

type Props = {
  heading: string
  subheading?: string
  disclaimer?: string
}

export const BrandForm: React.FC<Props> = ({ heading, subheading, disclaimer }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>()

  const onSubmit = async (_data: FormValues) => {
    document.dispatchEvent(new CustomEvent('ga4', { detail: { event: 'brand_form_submit' } }))
    reset()
  }

  return (
    <div className="ak-faq-form__panel">
      <h3 className="ak-faq-form__form-heading">{heading}</h3>
      {subheading && <p className="ak-faq-form__form-subheading">{subheading}</p>}

      {isSubmitSuccessful ? (
        <p
          role="status"
          className="ak-faq-form__success"
        >
          Thank you! We&apos;ll be in touch shortly.
        </p>
      ) : (
        <form
          className="ak-faq-form__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label={heading}
        >
          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="brandName">Brand name</label>
              <input
                id="brandName"
                type="text"
                className="bp-input"
                aria-required="true"
                aria-describedby={errors.brandName ? 'brandName-error' : undefined}
                {...register('brandName', { required: 'Brand name is required' })}
              />
              {errors.brandName && (
                <span
                  id="brandName-error"
                  role="alert"
                  className="ak-faq-form__error"
                >
                  {errors.brandName.message}
                </span>
              )}
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="workEmail">Work email</label>
              <input
                id="workEmail"
                type="email"
                className="bp-input"
                aria-required="true"
                aria-describedby={errors.workEmail ? 'workEmail-error' : undefined}
                {...register('workEmail', {
                  required: 'Work email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.workEmail && (
                <span
                  id="workEmail-error"
                  role="alert"
                  className="ak-faq-form__error"
                >
                  {errors.workEmail.message}
                </span>
              )}
            </div>
          </div>

          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="productCategory">Product category</label>
              <input
                id="productCategory"
                type="text"
                className="bp-input"
                {...register('productCategory')}
              />
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="targetVenues">Target venues</label>
              <input
                id="targetVenues"
                type="text"
                className="bp-input"
                {...register('targetVenues')}
              />
            </div>
          </div>

          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="desiredTimeline">Desired timeline</label>
              <input
                id="desiredTimeline"
                type="text"
                className="bp-input"
                {...register('desiredTimeline')}
              />
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="placementGoal">Placement goal</label>
              <input
                id="placementGoal"
                type="text"
                className="bp-input"
                {...register('placementGoal')}
              />
            </div>
          </div>

          <div className="ak-faq-form__field">
            <label htmlFor="message">Message / notes</label>
            <textarea
              id="message"
              className="bp-input ak-faq-form__textarea"
              rows={4}
              {...register('message')}
            />
          </div>

          <div className="ak-faq-form__submit-row">
            <button
              type="submit"
              className="bp-btn bp-btn--dark ak-faq-form__submit-btn"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Submit Brand Program Request'}
            </button>
            {disclaimer && <p className="ak-faq-form__disclaimer">{disclaimer}</p>}
          </div>
        </form>
      )}
    </div>
  )
}

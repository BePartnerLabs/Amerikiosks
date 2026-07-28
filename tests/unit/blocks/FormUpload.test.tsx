import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Upload } from '@/blocks/Form/Upload'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
afterEach(cleanup)

const onSubmit = vi.fn()

// The Upload dropzone keeps its File in component state and pushes it through
// setValue rather than through an input react-hook-form owns, so these tests
// drive it inside a real form to prove the value and its `required` rule
// actually reach react-hook-form.
const Harness: React.FC<{ required?: boolean }> = ({ required }) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Upload
          blockType="upload"
          uploadCollection="media"
          name="photo"
          label="Photo"
          required={required}
          errors={methods.formState.errors}
          register={methods.register}
          setValue={methods.setValue}
        />
        <button type="submit">Send</button>
      </form>
    </FormProvider>
  )
}

function selectFile(bytes: number, name = 'kiosk.png') {
  const file = new File([new Uint8Array(bytes)], name, { type: 'image/png' })
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [file] } })
  return file
}

describe('Form upload field', () => {
  it('blocks submission when the field is required and no file was chosen', async () => {
    onSubmit.mockClear()
    render(<Harness required />)

    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the chosen file as the field value', async () => {
    onSubmit.mockClear()
    render(<Harness required />)

    const file = selectFile(16)
    expect(screen.getByText('kiosk.png')).toBeTruthy()

    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].photo).toBe(file)
  })

  it('submits without a file when the field is optional', async () => {
    onSubmit.mockClear()
    render(<Harness />)

    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('rejects a file over the size limit and keeps it out of the submitted value', async () => {
    onSubmit.mockClear()
    render(<Harness required />)

    selectFile(8 * 1024 * 1024 + 1, 'huge.png')

    await waitFor(() => expect(screen.getByText('tooLarge')).toBeTruthy())
    expect(screen.queryByText('huge.png')).toBeNull()

    fireEvent.click(screen.getByText('Send'))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

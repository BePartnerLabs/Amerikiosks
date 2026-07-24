import { apiClient } from './clients/ApiClient'

export interface FormSubmissionData {
  form: string
  submissionData: { field: string; value: unknown }[]
}

const FORM_SUBMISSIONS_PATH = '/api/form-submissions'

export const FormsRepository = {
  async submit(data: FormSubmissionData): Promise<void> {
    const fileEntries = data.submissionData.filter(
      (item): item is { field: string; value: File } => item.value instanceof File,
    )

    if (fileEntries.length === 0) {
      await apiClient.post(FORM_SUBMISSIONS_PATH, data)
      return
    }

    // Payload's REST API expects multipart submissions as a `_payload` JSON
    // part (the non-file fields) plus one part per upload field, named after
    // the field itself — see addDataAndFileToRequest.js / handleUploads.js.
    const nonFileData = {
      ...data,
      submissionData: data.submissionData.filter((item) => !(item.value instanceof File)),
    }
    const formData = new FormData()
    formData.append('_payload', JSON.stringify(nonFileData))
    for (const { field, value } of fileEntries) {
      formData.append(field, value)
    }

    await apiClient.postFormData(FORM_SUBMISSIONS_PATH, formData)
  },
}

import { apiClient } from './clients/ApiClient'

export interface FormSubmissionData {
  form: string
  submissionData: { field: string; value: unknown }[]
  /** Hidden field a person never sees — only a bot fills it in. */
  honeypot?: string
  /** Epoch ms of when the form rendered; the route rejects instant submits. */
  renderedAt?: number
  /** Cloudflare Turnstile token, when Turnstile is enabled in Settings. */
  turnstileToken?: string
}

// Owned route rather than the plugin's public /api/form-submissions: it is the
// single place where rate limiting, the honeypot, Turnstile and server-side
// validation run before anything reaches the database (and Monday.com).
const FORM_SUBMISSIONS_PATH = '/next/form-submissions'

export const FormsRepository = {
  async submit(data: FormSubmissionData, onProgress?: (percent: number) => void): Promise<void> {
    const fileEntries = data.submissionData.filter(
      (item): item is { field: string; value: File } => item.value instanceof File,
    )

    if (fileEntries.length === 0) {
      await apiClient.post(FORM_SUBMISSIONS_PATH, data)
      return
    }

    // Same multipart shape the Payload REST API used before this moved to an
    // owned route — a `_payload` JSON part plus one part per upload field,
    // named after the field — so the route can keep parsing it either way.
    const nonFileData = {
      ...data,
      submissionData: data.submissionData.filter((item) => !(item.value instanceof File)),
    }
    const formData = new FormData()
    formData.append('_payload', JSON.stringify(nonFileData))
    for (const { field, value } of fileEntries) {
      formData.append(field, value)
    }

    await apiClient.postFormData(FORM_SUBMISSIONS_PATH, formData, onProgress)
  },
}

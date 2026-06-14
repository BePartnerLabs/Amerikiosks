import { apiClient } from './clients/ApiClient'

export interface FormSubmissionData {
  form: string
  submissionData: { field: string; value: unknown }[]
}

export const FormsRepository = {
  async submit(data: FormSubmissionData): Promise<void> {
    await apiClient.post('/form-submissions', data)
  },
}

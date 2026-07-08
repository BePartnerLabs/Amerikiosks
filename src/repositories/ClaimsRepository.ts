import { apiClient } from './clients/ApiClient'

export interface ClaimFormData {
  kioskBrand: string | number
  paymentMethod: string
  customerName: string
  customerEmail: string
  customerPhone: string
  transactionDateTime: string
  location: { state: string; city: string; propertyName: string }
  claimReason: string
  additionalInfo?: string
  lastFourCardDigits?: string
  photo?: File
  machineId?: string
}

export const ClaimsRepository = {
  async submit(data: ClaimFormData): Promise<{ id: string }> {
    return apiClient.post('/next/claims-submit', data)
  },
}

import { apiClient } from './clients/ApiClient'

export interface ClaimFormData {
  kioskBrand: string | number
  paymentMethod: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  transactionDateTime: string
  location: string
  claimReason: string
  additionalInfo?: string
  lastFourCardDigits?: string
  refundMethod?: string
  refundAccount?: string
  photo?: File
  machineId?: string
}

export const ClaimsRepository = {
  async submit(data: ClaimFormData): Promise<{ id: string }> {
    const formData = new FormData()
    formData.set('kioskBrand', String(data.kioskBrand))
    formData.set('paymentMethod', data.paymentMethod)
    formData.set('customerFirstName', data.customerFirstName)
    formData.set('customerLastName', data.customerLastName)
    formData.set('customerEmail', data.customerEmail)
    formData.set('customerPhone', data.customerPhone)
    formData.set('transactionDateTime', data.transactionDateTime)
    formData.set('location', data.location)
    formData.set('claimReason', data.claimReason)
    if (data.additionalInfo) formData.set('additionalInfo', data.additionalInfo)
    if (data.lastFourCardDigits) formData.set('lastFourCardDigits', data.lastFourCardDigits)
    if (data.refundMethod) formData.set('refundMethod', data.refundMethod)
    if (data.refundAccount) formData.set('refundAccount', data.refundAccount)
    if (data.machineId) formData.set('machineId', data.machineId)
    if (data.photo) formData.set('photo', data.photo)

    return apiClient.postFormData('/next/claims-submit', formData)
  },
}

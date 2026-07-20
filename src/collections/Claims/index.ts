import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { syncClaim } from './hooks/syncClaim'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    defaultColumns: ['customerName', 'claimReason', 'syncStatus', 'createdAt'],
    useAsTitle: 'customerName',
    description:
      'Refund/complaint claims submitted from the customer-service QR flow on deployed kiosks.',
  },
  access: {
    // Anonymous kiosk visitors must be able to submit a claim without logging in.
    create: anyone,
    // Only staff should be able to see, edit, or remove claim records.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [syncClaim],
  },
  fields: [
    {
      name: 'kioskBrand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      admin: {
        description: "Which client brand/product line was being purchased (e.g. Carlo's Bakery).",
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit/Debit Card', value: 'card' },
        { label: 'Cash', value: 'cash' },
        { label: 'Google Pay', value: 'google_pay' },
        { label: 'Apple Pay', value: 'apple_pay' },
      ],
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'transactionDateTime',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'location',
      type: 'group',
      admin: {
        description: 'Structured location — avoid free-text so downstream systems get clean data.',
      },
      fields: [
        { name: 'state', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'propertyName', type: 'text', required: true },
      ],
    },
    {
      name: 'claimReason',
      type: 'select',
      required: true,
      options: [
        { label: 'Only part of my order was dispensed', value: 'partial_dispense' },
        { label: 'The product was damaged', value: 'damaged_product' },
        { label: 'I received the wrong product', value: 'wrong_product' },
        { label: "I didn't receive my product", value: 'no_product' },
      ],
    },
    {
      name: 'additionalInfo',
      type: 'textarea',
    },
    {
      name: 'lastFourCardDigits',
      type: 'text',
      maxLength: 4,
      admin: {
        description: 'Last 4 digits of the card used, if payment method was card.',
      },
    },
    {
      name: 'refundMethod',
      type: 'select',
      options: [
        { label: 'Zelle', value: 'Zelle' },
        { label: 'CashApp', value: 'CashApp' },
        { label: 'PayPal', value: 'Paypal' },
        { label: 'Venmo', value: 'Venmo' },
      ],
      admin: {
        description:
          'Only relevant for cash refunds (card refunds go back to the card automatically). Values match JotForm\'s "Select a refund method" options verbatim.',
        condition: (data) => data?.paymentMethod === 'cash',
      },
    },
    {
      name: 'refundAccount',
      type: 'text',
      admin: {
        description: 'Username/email/phone associated with the refund method account above.',
        condition: (data) => data?.paymentMethod === 'cash',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          "Optional staff-attached photo (authenticated admin only). Public claim submissions don't populate this — the photo, if provided, is forwarded straight to JotForm without being stored here (see syncClaim.ts).",
      },
    },
    {
      name: 'machineId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description:
          'Captured from the QR code scan (machine_id query param), for internal reference.',
      },
    },
    {
      name: 'integrationTarget',
      type: 'select',
      defaultValue: 'jotform',
      options: [
        { label: 'JotForm', value: 'jotform' },
        { label: 'Odoo', value: 'odoo' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'syncStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Synced', value: 'synced' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'syncError',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'syncedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

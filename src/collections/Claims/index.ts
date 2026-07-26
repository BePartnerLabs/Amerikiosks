import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { photoUrlEndpoint } from './endpoints/photoUrl'
import { resyncEndpoint } from './endpoints/resync'
import { setDefaultIntegrationTarget } from './hooks/setDefaultIntegrationTarget'
import { syncClaim } from './hooks/syncClaim'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    defaultColumns: [
      'customerFirstName',
      'customerLastName',
      'claimReason',
      'syncStatus',
      'createdAt',
    ],
    useAsTitle: 'customerFirstName',
    description:
      'Refund/complaint claims submitted from the customer-service QR flow on deployed kiosks.',
    components: {
      beforeListTable: ['@/collections/Claims/components/ResyncListButton#ResyncListButton'],
      edit: {
        beforeDocumentControls: [
          '@/collections/Claims/components/ResyncDocButton#ResyncDocButton',
          '@/collections/Claims/components/ViewPhotoButton#ViewPhotoButton',
        ],
      },
    },
  },
  access: {
    // Anonymous kiosk visitors must be able to submit a claim without logging in.
    create: anyone,
    // Only staff should be able to see, edit, or remove claim records.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  endpoints: [photoUrlEndpoint, resyncEndpoint],
  hooks: {
    beforeValidate: [setDefaultIntegrationTarget],
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
      name: 'customerFirstName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerLastName',
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
      type: 'text',
      required: true,
      admin: {
        description:
          'Free-text reference for where the issue happened (state, city, property name) — not a structured address.',
      },
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
          'Only relevant for cash refunds (card refunds go back to the card automatically).',
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
          'Optional staff-attached photo (authenticated admin only). Public claim submissions never populate this field — see photoKey below for the customer-submitted photo.',
      },
    },
    {
      name: 'photoKey',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Object key of the customer-submitted photo in the private R2 bucket (see src/utilities/privateUpload.ts) — never a public URL. Fetch GET /api/claims/:id/photo-url (authenticated) to view it; the URL that returns expires in 15 minutes.',
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
      // No static defaultValue — set at creation time by
      // setDefaultIntegrationTarget.ts from Settings.defaultClaimIntegrationTarget,
      // since by the time a claim already exists it's too late to decide
      // where it should have gone (the sync hook already dispatched it).
      options: [
        { label: 'Odoo', value: 'odoo' },
        { label: 'Monday.com', value: 'monday' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Where this claim syncs to. Set automatically from Settings → Default Claim Integration Target when the claim is created; changing it here only affects a future re-sync, not one already dispatched.',
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

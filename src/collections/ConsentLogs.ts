import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

// Server-side proof-of-consent record. Deliberately holds no personal data
// (no IP, no fingerprint) — evidentiary value comes from the consentId
// round-trip: the same random id is written into the user's `ak_consent`
// cookie, so only someone who actually went through the real consent flow
// on their own device can ever present a matching id.
export const ConsentLogs: CollectionConfig = {
  slug: 'consentLogs',
  admin: {
    defaultColumns: ['consentId', 'analytics', 'createdAt'],
    useAsTitle: 'consentId',
  },
  access: {
    create: () => true,
    read: authenticated,
    update: () => false,
    delete: authenticated,
  },
  fields: [
    {
      name: 'consentId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'analytics',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'policyVersion',
      type: 'text',
    },
  ],
  timestamps: true,
}

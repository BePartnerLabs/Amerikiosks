import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

// Preserves the exact URL printed on physical QR codes on deployed kiosks —
// see docs/analytics-migration-report.md. Rendered via a dedicated route
// (src/app/(frontend)/[locale]/customer-service/request-a-refund/page.tsx)
// since the generic [slug] route only handles single-segment slugs.
export const seedCustomerServiceRequestARefund = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<void> => {
  payload.logger.info('— Seeding customer-service/request-a-refund page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Request a Refund',
      slug: 'customer-service-request-a-refund',
      hero: { type: 'none', links: [] },
      layout: [{ blockType: 'claimForm', submitButtonLabel: 'Submit claim' }],
      _status: 'published',
    },
    {
      title: 'Solicitar un reembolso',
      slug: 'customer-service-request-a-refund',
    },
  )
}

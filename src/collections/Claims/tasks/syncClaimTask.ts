import type { TaskConfig } from 'payload'
import { dispatchClaimSync } from '../dispatchClaimSync'

// Runs in a separate request from the one that created the claim (triggered
// via the internal /api/payload-jobs/run "webhook" call in syncClaim.ts), so
// the customer submitting the form never waits on JotForm's round trip.
export const syncClaimTask: TaskConfig<'syncClaimToIntegration'> = {
  slug: 'syncClaimToIntegration',
  inputSchema: [{ name: 'claimId', type: 'number', required: true }],
  handler: async ({ input, req }) => {
    const claim = await req.payload.findByID({
      collection: 'claims',
      id: input.claimId,
      depth: 0,
      req,
    })

    await dispatchClaimSync(claim, req)

    return { output: {} }
  },
}

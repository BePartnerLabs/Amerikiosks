/**
 * Guard that keeps local development from writing to the client's real
 * Monday.com boards.
 *
 * The boards this project talks to are production boards that Amerikiosks
 * staff work from every day (see docs/monday-forms-setup.md) — there is no
 * sandbox account. Without this, filling in a form on localhost creates a real
 * item someone then has to find and delete, and testing the refund flow files
 * a real claim.
 *
 * Shared by both repositories on purpose: MondayRepository (Claims) and
 * GenericMondayRepository (the form-builder sync) hit the same API with the
 * same token, so a guard on only one of them is a trap.
 *
 * Opt back in with `MONDAY_LIVE=true` in .env.local when you deliberately want
 * to exercise the integration end to end. Production is unaffected: the check
 * requires NODE_ENV === 'development'.
 */
export const isMondayMocked =
  process.env.NODE_ENV === 'development' && process.env.MONDAY_LIVE !== 'true'

/** Prints the request that would have been sent, so it can still be inspected. */
export function logMockedMondayCall(operation: string, details: Record<string, unknown>): void {
  console.info(
    `\n[monday:mock] ${operation} — not sent (NODE_ENV=development, MONDAY_LIVE unset)\n${JSON.stringify(details, null, 2)}\n`,
  )
}

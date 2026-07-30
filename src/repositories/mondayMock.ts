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
 * to exercise the integration end to end.
 *
 * The condition is "not production" rather than "development" on purpose: a
 * `payload run` script, a seed or a CLI job leaves NODE_ENV *undefined*, and
 * with an equality check that read as "not development" — so the guard turned
 * itself off exactly in the unattended context where a stray write to the
 * client's board is hardest to notice.
 *
 * `test` is excluded because the unit tests mock the HTTP client itself, so no
 * request can leave the machine anyway; guarding there would only stop them
 * from exercising the request-building code that is the thing under test.
 */
export const isMondayMocked =
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.MONDAY_LIVE !== 'true'

/** Prints the request that would have been sent, so it can still be inspected. */
export function logMockedMondayCall(operation: string, details: Record<string, unknown>): void {
  console.info(
    `\n[monday:mock] ${operation} — not sent (NODE_ENV is not production, MONDAY_LIVE unset)\n${JSON.stringify(details, null, 2)}\n`,
  )
}

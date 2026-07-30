/**
 * Picks which Monday.com API token to use.
 *
 * The token of record lives in Settings → Integrations (the client rotates it
 * from /admin, so it cannot be an env var in production). But a local database
 * is usually a restore of the production one, which means Settings holds the
 * *client's* token — and pointing local experiments at the client's boards is
 * exactly what src/repositories/mondayMock.ts exists to prevent.
 *
 * So outside production a MONDAY_API_TOKEN in .env.local wins: that is where you
 * put your own account's token to test against boards nobody depends on.
 * Everywhere else Settings wins, with the env var only as a fallback for a
 * deployment whose Settings has not been filled in yet.
 *
 * The condition below is "not production" rather than "development" for a
 * reason found the hard way: `payload run` loads .env.local but leaves NODE_ENV
 * *undefined*, so an equality check fell through to the Settings token — a
 * local script quietly talking to the client's boards.
 */
export function isMondayTokenFromEnv(): boolean {
  return process.env.NODE_ENV !== 'production' && Boolean(process.env.MONDAY_API_TOKEN?.trim())
}

export function resolveMondayToken(settings: { mondayApiToken?: string | null }): string {
  const fromEnv = process.env.MONDAY_API_TOKEN?.trim()

  if (isMondayTokenFromEnv()) return fromEnv as string

  return settings.mondayApiToken || fromEnv || ''
}

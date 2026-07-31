/**
 * Per-route limits, kept together so tuning one does not mean hunting through
 * three route files.
 *
 * Deliberately not one shared number. `consentLog` is called several times by a
 * single legitimate visitor — accept, reopen the panel, save again — while
 * submitting a form happens once in a very long while. A single value would
 * either be loose enough to leave the lead endpoint unguarded, or tight enough
 * that someone fiddling with the cookie banner can no longer send the form.
 * Losing a lead to the cookie notice is not a trade worth making.
 */
export const RATE_LIMITS = {
  formSubmissions: { windowMs: 60_000, max: 5 },
  claims: { windowMs: 60_000, max: 5 },
  consentLog: { windowMs: 60_000, max: 20 },
} as const

/**
 * In-memory sliding-window rate limiting for the public, unauthenticated POST
 * routes.
 *
 * **Be clear about what this buys.** State lives in the process. Vercel's Fluid
 * Compute reuses instances, so the map does survive between requests — but it
 * is wiped by any cold start or deploy, and under load the platform runs
 * several instances (and regions) in parallel, so the same client can be spread
 * across them and the effective limit becomes `max × instances`. It stops a
 * naive script hammering one endpoint from one address. It is not a defence,
 * and it does not protect spend: by the time it answers, the function has
 * already been invoked and billed.
 *
 * The real limit belongs in the Vercel WAF, which counts outside the function
 * and whose blocked traffic is not billed at all. This stays as the backstop
 * that still works in preview, locally, and if a firewall rule is ever removed.
 * If it ever has to be exact, use Vercel's Rate Limiting SDK rather than
 * growing this.
 *
 * Each caller gets its own bucket — see RATE_LIMITS above for why. Note that a
 * shared module would not give a shared counter anyway: each route handler is
 * bundled and run as its own function, so they do not share a process.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const requestLog = new Map<string, number[]>()
  let lastSweep = 0

  return function isRateLimited(ip: string): boolean {
    const now = Date.now()

    // The map is keyed on a client-controlled string, so without eviction every
    // address that ever knocked stays resident for the life of the process —
    // slow, unbounded growth an attacker chooses the rate of. Sweeping once per
    // window keeps that cost proportional to *active* callers instead of to
    // every caller ever seen, and it stays O(entries) once per window rather
    // than on every request.
    if (now - lastSweep >= windowMs) {
      for (const [key, times] of requestLog) {
        if (times.every((t) => now - t >= windowMs)) requestLog.delete(key)
      }
      lastSweep = now
    }

    const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < windowMs)

    // Denied requests are recorded too, on purpose: a client that keeps
    // hammering keeps refreshing its own window and stays blocked until it
    // actually backs off. Letting rejections go unrecorded would hand a busy
    // attacker a steady trickle of accepted requests forever.
    timestamps.push(now)
    requestLog.set(ip, timestamps)
    return timestamps.length > max
  }
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}

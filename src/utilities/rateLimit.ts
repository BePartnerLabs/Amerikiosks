/**
 * In-memory sliding-window rate limiting for the public, unauthenticated POST
 * routes.
 *
 * Was copy-pasted in `next/form-submissions` and `next/claims-submit`, and
 * missing entirely from `next/consent-log` — which is the failure mode this
 * exists to prevent: a guard that has to be re-typed for each new route is a
 * guard the next route forgets.
 *
 * Each caller gets its **own** bucket. A shared map would let form submissions
 * eat the consent log's allowance and vice versa, so one busy endpoint would
 * start rejecting traffic on an unrelated one.
 *
 * State lives in the process, so it resets on redeploy or cold start and is not
 * shared across instances or regions. That is an accepted tradeoff for a
 * low-effort abuse guard, not a substitute for a shared store (Redis) if this
 * ever needs to hold globally.
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

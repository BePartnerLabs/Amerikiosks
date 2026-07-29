import configPromise from '@payload-config'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from 'payload'
import {
  type FieldSpec,
  isPhoneField,
  isWebsiteField,
  normalizePhone,
  normalizeWebsite,
  validateSubmission,
} from '@/blocks/Form/validation'
import { syncFormSubmission } from '@/collections/FormSubmissions/hooks/syncFormSubmission'
import { detectImageMimeType } from '@/utilities/detectImageMimeType'
import { uploadPrivateFile } from '@/utilities/privateUpload'

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8MB — mirrors Form/Upload/index.tsx

// Anything faster than this is a script, not a person filling in a form.
const MIN_FILL_MS = 3_000

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Basic in-memory sliding-window rate limit — resets on redeploy/cold start,
// which is an accepted tradeoff for a low-effort abuse guard on a public,
// unauthenticated POST endpoint. Same approach (and same caveat) as
// next/claims-submit/route.ts. Not a substitute for a shared store (e.g.
// Redis) if this ever needs to hold across instances/regions.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5
const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}

// Duck-typed instead of `instanceof File` — the File constructed by a real
// browser/undici request and the one jsdom's test environment provides are
// different realms, so `instanceof` silently fails across that boundary even
// though both are structurally identical Blob-like File objects.
function isFileLike(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function' &&
    typeof (value as { size?: unknown }).size === 'number' &&
    typeof (value as { name?: unknown }).name === 'string'
  )
}

type SubmissionEntry = { field: string; value: unknown }

type RequestPayload = {
  form?: string | number
  submissionData?: SubmissionEntry[]
  // Anti-bot envelope, added by FormsRepository — never part of the form itself.
  honeypot?: string
  renderedAt?: number
  turnstileToken?: string
}

async function verifyTurnstile(token: string | undefined, secret: string, ip: string) {
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip })
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body })
    const json = (await res.json()) as { success?: boolean }
    return json.success === true
  } catch (err) {
    // A Cloudflare outage should not take every form on the site down with it.
    console.error('[form-submissions] Turnstile verification failed to run:', err)
    return true
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  let body: RequestPayload
  const files = new Map<string, File>()

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const raw = formData.get('_payload')
    body = typeof raw === 'string' ? JSON.parse(raw) : {}
    for (const [key, value] of formData.entries()) {
      if (key !== '_payload' && isFileLike(value)) files.set(key, value)
    }
  } else {
    body = (await req.json()) as RequestPayload
  }

  // Honeypot + timing. Both answer 201 without writing anything: a bot that
  // learns which signal caught it just adapts, so silence is the useful reply.
  const trippedHoneypot = Boolean(body.honeypot)
  const tooFast = typeof body.renderedAt === 'number' && Date.now() - body.renderedAt < MIN_FILL_MS
  if (trippedHoneypot || tooFast) {
    console.warn(
      `[form-submissions] discarded submission from ${ip} (${trippedHoneypot ? 'honeypot' : 'too fast'})`,
    )
    return Response.json({ ok: true }, { status: 201 })
  }

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'settings' })

  // Both keys, not just the secret: the widget only renders when the layout
  // finds a site key, so enforcing with the secret alone would mean the browser
  // never produces a token and every genuine submission 403s. Half-configured
  // must behave like off, not like a wall.
  if (settings.turnstileEnabled && settings.turnstileSecretKey && settings.turnstileSiteKey) {
    const ok = await verifyTurnstile(body.turnstileToken, settings.turnstileSecretKey, ip)
    if (!ok) {
      return Response.json({ error: 'Bot verification failed.' }, { status: 403 })
    }
  }

  if (!body.form) {
    return Response.json({ error: 'Missing form id.' }, { status: 400 })
  }

  const form = await payload.findByID({
    collection: 'forms',
    id: body.form,
    depth: 0,
  })
  if (!form) {
    return Response.json({ error: 'Unknown form.' }, { status: 400 })
  }

  const declaredSpecs = (form.fields ?? []) as FieldSpec[]

  // The consent checkbox is rendered by FormBlock itself when the form has
  // `requiresConsent`, not declared as a form-builder field — so it has no
  // spec of its own. Without this synthetic one it was both rejected as an
  // undeclared field (a 400 on every consent form) and never recorded, which
  // is the exact failure the feature exists to prevent: the visitor ticks a
  // required box and nothing is stored.
  const requiresConsent = Boolean((form as { requiresConsent?: boolean }).requiresConsent)
  // A new array, never a push: `form.fields` is the fetched document's own
  // array, and mutating it would edit the object the caller handed us.
  const specs: FieldSpec[] = requiresConsent
    ? [...declaredSpecs, { name: 'consent', blockType: 'checkbox', required: true }]
    : declaredSpecs

  // Upload fields arrive as multipart parts, not as submissionData values, so
  // they are validated separately below — exclude them from the value pass.
  // Both sides of it: dropping only the *specs* left the browser's own entry
  // for the file input with nothing to match against, and every form with an
  // upload field 400'd on `unknownField`.
  const uploadFieldNames = new Set(
    specs.filter((f) => f.blockType === 'upload' && f.name).map((f) => f.name as string),
  )
  const submissionData = (body.submissionData ?? []).filter(
    (entry) => !uploadFieldNames.has(entry.field),
  )

  const issues = validateSubmission(
    specs.filter((f) => !uploadFieldNames.has(f.name ?? '')),
    submissionData,
  )
  for (const name of uploadFieldNames) {
    const spec = specs.find((f) => f.name === name)
    if (spec?.required && !files.has(name)) issues.push({ field: name, code: 'required' })
  }

  if (issues.length > 0) {
    return Response.json({ error: 'Validation failed.', issues }, { status: 400 })
  }

  // Attachments go to the private R2 bucket, never to the public `media`
  // collection: `media` is world-readable and its objects are served straight
  // off R2's public URL, and these files are business documents attached to a
  // lead. What lands on the submission is the object key, exactly like
  // Claims.photoKey — see the `attachments` field in src/plugins/index.ts.
  const attachments: { field: string; key: string; filename: string; mimeType: string }[] = []
  for (const [fieldName, file] of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json({ error: 'File exceeds the 8MB size limit.' }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const detectedType = detectImageMimeType(bytes)
    if (!detectedType) {
      return Response.json(
        { error: 'File must be a JPEG, PNG, WEBP, or HEIC image.' },
        { status: 400 },
      )
    }
    const filename = file.name || 'upload'
    try {
      const key = await uploadPrivateFile(Buffer.from(arrayBuffer), detectedType, filename)
      attachments.push({ field: fieldName, key, filename, mimeType: detectedType })
    } catch (err) {
      // Storage being misconfigured or unreachable is our problem, not the
      // visitor's, but it must not surface as an unhandled 500 either: they get
      // a sentence they can act on, and the detail goes to the log. (Seen for
      // real when a local S3_ENDPOINT had the public bucket baked into its
      // path, so the private bucket resolved to a nested key and R2 answered
      // AccessDenied.)
      console.error('[form-submissions] could not store the attachment:', err)
      return Response.json(
        { error: 'We could not store your file. Please try again in a moment.' },
        { status: 503 },
      )
    }
  }

  const normalized = submissionData.map((entry) => {
    const spec = specs.find((f) => f.name === entry.field)
    if (spec && typeof entry.value === 'string') {
      if (isPhoneField(spec)) return { ...entry, value: normalizePhone(entry.value) }
      if (isWebsiteField(spec)) return { ...entry, value: normalizeWebsite(entry.value) }
    }
    return entry
  })

  try {
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: body.form,
        submissionData: normalized,
        ...(attachments.length > 0 ? { attachments } : {}),
        // Mirrored onto the document itself so the consent record stands on
        // its own as proof, rather than living inside a submissionData blob.
        ...(requiresConsent
          ? {
              consentGiven: Boolean(submissionData.find((e) => e.field === 'consent')?.value),
              consentAt: new Date().toISOString(),
            }
          : {}),
      } as unknown as RequiredDataFromCollectionSlug<'form-submissions'>,
      // This route is the trust boundary — the collection itself denies public
      // creates (see formSubmissionOverrides in src/plugins/index.ts) so the
      // plugin's REST endpoint can't be used to walk around these checks.
      overrideAccess: true,
    })

    // After the create has committed, and without the request's transactional
    // req — a failure here (Monday down, a bad column mapping, a DB hiccup)
    // must not be able to undo the submission that is now safely stored.
    // syncFormSubmission swallows its own errors and records them on the
    // document as syncStatus: 'error', so this await cannot throw.
    await syncFormSubmission({ payload, doc: submission as never })

    return Response.json(submission, { status: 201 })
  } catch (err) {
    console.error('[form-submissions] create failed:', err)
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

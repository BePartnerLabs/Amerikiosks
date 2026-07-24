import configPromise from '@payload-config'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { detectImageMimeType } from '@/utilities/detectImageMimeType'
import { uploadPrivateFile } from '@/utilities/privateUpload'

const MAX_PHOTO_BYTES = 8 * 1024 * 1024 // 8MB

// Basic in-memory sliding-window rate limit — resets on redeploy/cold start,
// which is an accepted tradeoff for a low-effort abuse guard on a public,
// unauthenticated POST endpoint. Not a substitute for a shared store (e.g.
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

function stringField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name)
  return typeof value === 'string' && value.length > 0 ? value : undefined
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

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return Response.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const formData = await req.formData()
  const payload = await getPayload({ config: configPromise })

  const kioskBrandRaw = stringField(formData, 'kioskBrand')

  const data = {
    // kioskBrand is a relationship (numeric row id) — FormData only carries
    // strings, so it must be coerced back before reaching the Local API,
    // same as the pre-FormData JSON flow did client-side before this route
    // switched to multipart for the photo upload.
    kioskBrand: kioskBrandRaw ? Number(kioskBrandRaw) : undefined,
    paymentMethod: stringField(formData, 'paymentMethod'),
    customerFirstName: stringField(formData, 'customerFirstName'),
    customerLastName: stringField(formData, 'customerLastName'),
    customerEmail: stringField(formData, 'customerEmail'),
    customerPhone: stringField(formData, 'customerPhone'),
    transactionDateTime: stringField(formData, 'transactionDateTime'),
    location: stringField(formData, 'location'),
    claimReason: stringField(formData, 'claimReason'),
    additionalInfo: stringField(formData, 'additionalInfo'),
    lastFourCardDigits: stringField(formData, 'lastFourCardDigits'),
    refundMethod: stringField(formData, 'refundMethod'),
    refundAccount: stringField(formData, 'refundAccount'),
    machineId: stringField(formData, 'machineId'),
  }

  // The photo is uploaded to a private (non-public) R2 bucket under a random
  // key, never to Claims.photo/Payload Media — see that field's admin
  // description. Its key is stored directly on the claim (Claims.photoKey);
  // viewing it later happens on demand via the authenticated
  // GET /api/claims/:id/photo-url endpoint, which mints a short-lived
  // presigned URL — the object itself is never reachable by a public URL.
  let photoKey: string | undefined
  const photoFile = formData.get('photo')
  if (isFileLike(photoFile)) {
    if (photoFile.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: 'Photo exceeds the 8MB size limit.' }, { status: 400 })
    }
    const arrayBuffer = await photoFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const detectedType = detectImageMimeType(bytes)
    if (!detectedType) {
      return Response.json(
        { error: 'Photo must be a JPEG, PNG, WEBP, or HEIC image.' },
        { status: 400 },
      )
    }
    photoKey = await uploadPrivateFile(
      Buffer.from(arrayBuffer),
      detectedType,
      photoFile.name || 'claim-photo',
    )
  }

  try {
    const claim = await payload.create({
      collection: 'claims',
      data: { ...data, photoKey } as unknown as RequiredDataFromCollectionSlug<'claims'>,
      overrideAccess: false,
    })

    return Response.json(claim, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

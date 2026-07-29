import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
const uploadPrivateFileMock = vi.fn()
vi.mock('@/utilities/privateUpload', () => ({
  uploadPrivateFile: (...args: unknown[]) => uploadPrivateFileMock(...args),
}))
// The sync runs after the create commits; it has its own tests.
vi.mock('@/collections/FormSubmissions/hooks/syncFormSubmission', () => ({
  syncFormSubmission: vi.fn(),
}))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

// A minimal valid JPEG (SOI + EOI markers) — enough for detectImageMimeType's
// magic-byte sniff to recognise it. Twelve bytes is also its minimum length.
const FAKE_JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9])

// Same length, no recognisable signature — what a renamed .exe looks like.
const NOT_AN_IMAGE_BYTES = new Uint8Array([0x4d, 0x5a, 0x90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// route.ts duck-types uploads via arrayBuffer/size/name rather than
// `instanceof File`, precisely because the File this jsdom environment builds
// is not the File the Next.js runtime sees (different realms). Stubbing that
// shape exercises the real path without fighting cross-realm FormData/File
// construction, which is Next.js/Node's parsing concern rather than this
// route's logic. Same approach as claims-submit.test.ts.
type FakeFile = { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }

function fakeFile(bytes: Uint8Array, name: string, sizeOverride?: number): FakeFile {
  return {
    name,
    size: sizeOverride ?? bytes.byteLength,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  }
}

// The route's rate limiter keys on x-forwarded-for and its Map lives at module
// scope, surviving every test in this file. Handing each request its own IP
// keeps the other cases independent; the rate-limit test opts back in by
// passing a fixed one.
let requestCounter = 0

function nextIp(): string {
  requestCounter += 1
  return `10.0.0.${requestCounter}`
}

type Body = Record<string, unknown>

function jsonRequest(body: Body, ip = nextIp()): Request {
  return {
    headers: {
      get: (name: string) =>
        name === 'x-forwarded-for' ? ip : name === 'content-type' ? 'application/json' : null,
    },
    json: async () => body,
  } as unknown as Request
}

function multipartRequest(body: Body, files: Record<string, FakeFile>, ip = nextIp()): Request {
  const entries: [string, string | FakeFile][] = [
    ['_payload', JSON.stringify(body)],
    ...Object.entries(files),
  ]

  return {
    headers: {
      get: (name: string) =>
        name === 'x-forwarded-for'
          ? ip
          : name === 'content-type'
            ? 'multipart/form-data; boundary=x'
            : null,
    },
    formData: async () => ({
      get: (name: string) => entries.find(([k]) => k === name)?.[1] ?? null,
      entries: () => entries[Symbol.iterator](),
    }),
  } as unknown as Request
}

function callPOST(req: Request) {
  return import('@/app/(frontend)/next/form-submissions/route').then(({ POST }) => POST(req))
}

const CONTACT_FIELDS = [
  { blockType: 'text', name: 'name', required: true },
  { blockType: 'email', name: 'email', required: true },
  { blockType: 'text', name: 'phone', label: 'Phone' },
]

type PayloadStub = {
  findGlobal: ReturnType<typeof vi.fn>
  findByID: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

/** Wires getPayload with a Turnstile-disabled Settings global by default. */
function stubPayload(
  overrides: {
    settings?: Record<string, unknown>
    form?: Record<string, unknown> | null
    create?: ReturnType<typeof vi.fn>
  } = {},
): PayloadStub {
  const stub: PayloadStub = {
    findGlobal: vi.fn().mockResolvedValue(overrides.settings ?? { turnstileEnabled: false }),
    findByID: vi
      .fn()
      .mockResolvedValue(
        overrides.form === undefined ? { id: 'contact', fields: CONTACT_FIELDS } : overrides.form,
      ),
    create: overrides.create ?? vi.fn().mockResolvedValue({ id: 42 }),
  }
  mockGetPayload.mockResolvedValue(stub as unknown as Awaited<ReturnType<typeof getPayload>>)
  return stub
}

const validSubmission = [
  { field: 'name', value: 'Ada' },
  { field: 'email', value: 'ada@example.com' },
]

describe('POST /next/form-submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('happy path', () => {
    it('creates the submission with overrideAccess: true and returns 201', async () => {
      const stub = stubPayload()

      const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      expect(res.status).toBe(201)
      await expect(res.json()).resolves.toEqual({ id: 42 })
      expect(stub.create).toHaveBeenCalledTimes(1)
      const [args] = stub.create.mock.calls[0]
      expect(args.collection).toBe('form-submissions')
      expect(args.data.form).toBe('contact')
      expect(args.data.submissionData).toEqual(validSubmission)
      // The collection denies public creates; this route is the trust boundary.
      expect(args.overrideAccess).toBe(true)
    })

    it('normalizes phone values before storing them', async () => {
      const stub = stubPayload()

      await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: [...validSubmission, { field: 'phone', value: '+1 (305) 555-0100' }],
        }),
      )

      const stored = stub.create.mock.calls[0][0].data.submissionData
      expect(stored).toContainEqual({ field: 'phone', value: '+13055550100' })
    })
  })

  describe('silent bot rejections', () => {
    // Both answer 201: a bot that learns which signal caught it just adapts.
    it('discards a submission that filled the honeypot, without writing', async () => {
      const stub = stubPayload()

      const res = await callPOST(
        jsonRequest({ form: 'contact', submissionData: validSubmission, honeypot: 'gotcha' }),
      )

      expect(res.status).toBe(201)
      await expect(res.json()).resolves.toEqual({ ok: true })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('discards a submission completed faster than a human could type it', async () => {
      const stub = stubPayload()

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: validSubmission,
          renderedAt: Date.now() - 500,
        }),
      )

      expect(res.status).toBe(201)
      await expect(res.json()).resolves.toEqual({ ok: true })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('accepts a submission that took longer than the minimum fill time', async () => {
      const stub = stubPayload()

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: validSubmission,
          renderedAt: Date.now() - 10_000,
        }),
      )

      expect(res.status).toBe(201)
      expect(stub.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('rate limiting', () => {
    it('rejects the sixth request from one IP inside the window with 429', async () => {
      stubPayload()
      const ip = '203.0.113.99'

      for (let i = 0; i < 5; i++) {
        const res = await callPOST(
          jsonRequest({ form: 'contact', submissionData: validSubmission }, ip),
        )
        expect(res.status).toBe(201)
      }

      const res = await callPOST(
        jsonRequest({ form: 'contact', submissionData: validSubmission }, ip),
      )
      expect(res.status).toBe(429)
    })

    it('does not count another IP against that budget', async () => {
      stubPayload()

      const res = await callPOST(
        jsonRequest({ form: 'contact', submissionData: validSubmission }, '203.0.113.100'),
      )

      expect(res.status).toBe(201)
    })
  })

  describe('Turnstile', () => {
    it('rejects with 403 when verification says the token is not valid', async () => {
      const stub = stubPayload({
        settings: {
          turnstileEnabled: true,
          turnstileSecretKey: 'secret',
          turnstileSiteKey: 'site',
        },
      })
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ success: false })),
      )

      const res = await callPOST(
        jsonRequest({ form: 'contact', submissionData: validSubmission, turnstileToken: 'bad' }),
      )

      expect(res.status).toBe(403)
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('rejects with 403 when no token was sent at all', async () => {
      const stub = stubPayload({
        settings: {
          turnstileEnabled: true,
          turnstileSecretKey: 'secret',
          turnstileSiteKey: 'site',
        },
      })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      expect(res.status).toBe(403)
      // Missing token short-circuits — no point asking Cloudflare about nothing.
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('lets the submission through when Cloudflare itself is unreachable', async () => {
      // Fail open on purpose: an outage there must not take every form down.
      const stub = stubPayload({
        settings: {
          turnstileEnabled: true,
          turnstileSecretKey: 'secret',
          turnstileSiteKey: 'site',
        },
      })
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const res = await callPOST(
        jsonRequest({ form: 'contact', submissionData: validSubmission, turnstileToken: 'any' }),
      )

      expect(res.status).toBe(201)
      expect(stub.create).toHaveBeenCalledTimes(1)
    })

    it('skips verification entirely when Turnstile is disabled', async () => {
      stubPayload({ settings: { turnstileEnabled: false, turnstileSecretKey: 'secret' } })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      expect(res.status).toBe(201)
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    // Turning the toggle on and filling only one of the two keys is the easy
    // mistake to make in /admin. The widget needs the site key to render, so
    // enforcing on the secret alone would 403 every real visitor.
    it('does not enforce when it is enabled but only half configured', async () => {
      stubPayload({ settings: { turnstileEnabled: true, turnstileSecretKey: 'secret' } })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      expect(res.status).toBe(201)
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('returns 400 when the form id is missing', async () => {
      const stub = stubPayload()

      const res = await callPOST(jsonRequest({ submissionData: validSubmission }))

      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toEqual({ error: 'Missing form id.' })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('returns 400 when the form id does not resolve to a form', async () => {
      const stub = stubPayload({ form: null })

      const res = await callPOST(jsonRequest({ form: 'nope', submissionData: validSubmission }))

      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toEqual({ error: 'Unknown form.' })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('returns the issue list when a value fails the shared rules', async () => {
      const stub = stubPayload()

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: [
            { field: 'name', value: 'Ada' },
            { field: 'email', value: 'not-an-email' },
          ],
        }),
      )

      expect(res.status).toBe(400)
      const json = (await res.json()) as { error: string; issues: unknown[] }
      expect(json.error).toBe('Validation failed.')
      expect(json.issues).toContainEqual({ field: 'email', code: 'email' })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('rejects a field the form never declared', async () => {
      stubPayload()

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: [...validSubmission, { field: 'isAdmin', value: true }],
        }),
      )

      expect(res.status).toBe(400)
      const json = (await res.json()) as { issues: unknown[] }
      expect(json.issues).toContainEqual({ field: 'isAdmin', code: 'unknownField' })
    })

    it('flags a required upload that arrived with no file attached', async () => {
      stubPayload({
        form: {
          id: 'contact',
          fields: [...CONTACT_FIELDS, { blockType: 'upload', name: 'photo', required: true }],
        },
      })

      const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      expect(res.status).toBe(400)
      const json = (await res.json()) as { issues: unknown[] }
      expect(json.issues).toContainEqual({ field: 'photo', code: 'required' })
    })
  })

  describe('uploads', () => {
    const formWithUpload = {
      id: 'contact',
      fields: [...CONTACT_FIELDS, { blockType: 'upload', name: 'photo' }],
    }

    it('stores the upload in the private bucket and records only its key', async () => {
      const create = vi.fn().mockResolvedValue({ id: 42 })
      uploadPrivateFileMock.mockResolvedValue('abc-123.jpg')
      const stub = stubPayload({ form: formWithUpload, create })

      const res = await callPOST(
        multipartRequest(
          { form: 'contact', submissionData: validSubmission },
          { photo: fakeFile(FAKE_JPEG_BYTES, 'kiosk.jpg') },
        ),
      )

      expect(res.status).toBe(201)

      // Never the public `media` collection: these are business documents
      // attached to a lead, and media is world-readable.
      for (const [args] of stub.create.mock.calls) {
        expect(args.collection).not.toBe('media')
      }

      // Sniffed from the magic bytes, never from the filename or File.type.
      expect(uploadPrivateFileMock).toHaveBeenCalledWith(
        expect.anything(),
        'image/jpeg',
        'kiosk.jpg',
      )

      const [submissionArgs] = stub.create.mock.calls[0]
      expect(submissionArgs.data.attachments).toEqual([
        { field: 'photo', key: 'abc-123.jpg', filename: 'kiosk.jpg', mimeType: 'image/jpeg' },
      ])
      // The key must not leak into submissionData, which is what gets mapped
      // to Monday columns as plain text.
      expect(submissionArgs.data.submissionData).not.toContainEqual(
        expect.objectContaining({ field: 'photo' }),
      )
    })

    // The browser registers the file input like any other field, so its entry
    // shows up in submissionData with no value. Upload specs are excluded from
    // the value pass, so that entry had nothing to match and every form with an
    // upload field 400'd on `unknownField` — with no file attached at all.
    it('ignores the submissionData entry the browser sends for a file input', async () => {
      const create = vi.fn().mockResolvedValue({ id: 42 })
      const stub = stubPayload({ form: formWithUpload, create })

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: [...validSubmission, { field: 'photo', value: undefined }],
        }),
      )

      expect(res.status).toBe(201)
      const [submissionArgs] = stub.create.mock.calls[0]
      expect(submissionArgs.data.submissionData).not.toContainEqual(
        expect.objectContaining({ field: 'photo' }),
      )
    })

    it('rejects a file over the 8MB cap before reading it', async () => {
      const stub = stubPayload({ form: formWithUpload })

      const res = await callPOST(
        multipartRequest(
          { form: 'contact', submissionData: validSubmission },
          { photo: fakeFile(FAKE_JPEG_BYTES, 'huge.jpg', 9 * 1024 * 1024) },
        ),
      )

      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toEqual({ error: 'File exceeds the 8MB size limit.' })
      expect(stub.create).not.toHaveBeenCalled()
    })

    it('rejects a non-image whose bytes do not match any allowed signature', async () => {
      const stub = stubPayload({ form: formWithUpload })

      const res = await callPOST(
        multipartRequest(
          { form: 'contact', submissionData: validSubmission },
          { photo: fakeFile(NOT_AN_IMAGE_BYTES, 'payload.jpg') },
        ),
      )

      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toEqual({
        error: 'File must be a JPEG, PNG, WEBP, or HEIC image.',
      })
      expect(stub.create).not.toHaveBeenCalled()
    })
  })

  describe('consent mirroring', () => {
    const formWithConsent = {
      id: 'contact',
      fields: [...CONTACT_FIELDS, { blockType: 'checkbox', name: 'consent', required: true }],
    }

    it('mirrors a granted consent onto the document with a timestamp', async () => {
      const stub = stubPayload({ form: formWithConsent })

      const res = await callPOST(
        jsonRequest({
          form: 'contact',
          submissionData: [...validSubmission, { field: 'consent', value: true }],
        }),
      )

      expect(res.status).toBe(201)
      const { data } = stub.create.mock.calls[0][0]
      expect(data.consentGiven).toBe(true)
      expect(Date.parse(data.consentAt)).not.toBeNaN()
    })

    it('leaves the mirrored fields off entirely when the form has no consent field', async () => {
      const stub = stubPayload()

      await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

      const { data } = stub.create.mock.calls[0][0]
      expect(data).not.toHaveProperty('consentGiven')
      expect(data).not.toHaveProperty('consentAt')
    })
  })

  it('returns 400 with the message when the create itself fails', async () => {
    const create = vi.fn().mockRejectedValue(new Error('duplicate submission'))
    stubPayload({ create })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await callPOST(jsonRequest({ form: 'contact', submissionData: validSubmission }))

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'duplicate submission' })
  })
})

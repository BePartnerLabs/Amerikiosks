import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

const uploadPrivateFileMock = vi.fn()
vi.mock('@/utilities/privateUpload', () => ({ uploadPrivateFile: uploadPrivateFileMock }))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

const validFields: Record<string, string> = {
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerFirstName: 'Test',
  customerLastName: 'Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: 'BePartnerLabs Test Property, Doral, FL',
  claimReason: 'partial_dispense',
  machineId: 'AK-0231',
}

// A minimal valid JPEG (SOI marker + EOI marker) — enough for the magic-byte
// sniff in detectImageMimeType to recognize it as image/jpeg.
const FAKE_JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9])

// A minimal stand-in for a File — route.ts duck-types via arrayBuffer/size/name
// rather than `instanceof File`, specifically because a real Fetch API File
// constructed in this jsdom test environment is not recognized by `instanceof`
// against the File the Next.js route runtime would see (different realms). This
// stub exercises that same duck-typed path without fighting cross-realm Request/
// FormData/File construction, which is a runtime-parsing concern Next.js/Node
// owns, not something this route's own logic is responsible for.
type FakeFile = { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }

function fakeFile(bytes: Uint8Array, name: string): FakeFile {
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  }
}

// Each call gets its own fake IP — the route's in-memory rate limiter keys
// on x-forwarded-for, and its Map persists across tests in this file since
// the route module is only imported/evaluated once.
let requestCounter = 0

function fakeRequest(fields: Record<string, string>, photo?: FakeFile) {
  const store = new Map<string, string | FakeFile>(Object.entries(fields))
  if (photo) store.set('photo', photo)
  requestCounter += 1
  const ip = `10.0.0.${requestCounter}`

  return {
    headers: { get: (name: string) => (name === 'x-forwarded-for' ? ip : null) },
    formData: async () => ({
      get: (name: string) => store.get(name) ?? null,
    }),
  } as unknown as Request
}

function callPOST(fields: Record<string, string>, photo?: FakeFile) {
  return import('@/app/(frontend)/next/claims-submit/route').then(({ POST }) =>
    POST(fakeRequest(fields, photo)),
  )
}

describe('POST /next/claims-submit', () => {
  it('creates a claim via the Local API (overrideAccess: false) and returns 201', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1, ...validFields })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const res = await callPOST(validFields)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'claims',
        data: expect.objectContaining({
          customerFirstName: 'Test',
          customerLastName: 'Prueba',
          machineId: 'AK-0231',
        }),
        overrideAccess: false,
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toMatchObject({ id: 1 })
  })

  it('coerces kioskBrand back to a number — FormData only carries strings, but it is a relationship (numeric row id)', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    await callPOST({ ...validFields, kioskBrand: '1' })

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ kioskBrand: 1 }) }),
    )
    const [call] = create.mock.calls
    expect(typeof call[0].data.kioskBrand).toBe('number')
  })

  it('passes the location field through as a plain string', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    await callPOST(validFields)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ location: validFields.location }),
      }),
    )
  })

  it('returns 400 when Payload rejects the submission (e.g. missing required field)', async () => {
    const create = vi
      .fn()
      .mockRejectedValue(new Error('ValidationError: customerEmail is required'))
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const res = await callPOST({ ...validFields, customerEmail: '' })

    expect(res.status).toBe(400)
  })

  it('accepts a valid image photo, uploads it to private storage, and stores only the returned key on the claim', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)
    uploadPrivateFileMock.mockResolvedValue('abc123.jpg')

    const photo = fakeFile(FAKE_JPEG_BYTES, 'issue.jpg')
    const res = await callPOST(validFields, photo)

    expect(res.status).toBe(201)
    expect(uploadPrivateFileMock).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/jpeg',
      'issue.jpg',
    )
    const [call] = create.mock.calls
    expect(call[0].data.photoKey).toBe('abc123.jpg')
    expect(call[0].data.photo).toBeUndefined()
  })

  it('rejects a file whose real content is not an allowlisted image type, regardless of its claimed name', async () => {
    const create = vi.fn()
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const notAnImage = fakeFile(new Uint8Array([1, 2, 3, 4]), 'fake.jpg')
    const res = await callPOST(validFields, notAnImage)

    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects a photo over the 8MB size limit before reading its bytes', async () => {
    const create = vi.fn()
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const oversized = fakeFile(new Uint8Array(8 * 1024 * 1024 + 1), 'huge.jpg')
    const res = await callPOST(validFields, oversized)

    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})

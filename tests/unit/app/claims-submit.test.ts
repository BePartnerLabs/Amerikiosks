import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

const validFields: Record<string, string> = {
  kioskBrand: 'brand-1',
  paymentMethod: 'card',
  customerName: 'Test Prueba',
  customerEmail: 'hola@bepartnerlabs.com',
  customerPhone: '3055550100',
  transactionDateTime: '2026-07-08T09:23:00.000Z',
  location: JSON.stringify({
    state: 'FL',
    city: 'Doral',
    propertyName: 'BePartnerLabs Test Property',
  }),
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

function fakeRequest(fields: Record<string, string>, photo?: FakeFile) {
  const store = new Map<string, string | FakeFile>(Object.entries(fields))
  if (photo) store.set('photo', photo)

  return {
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
        data: expect.objectContaining({ customerName: 'Test Prueba', machineId: 'AK-0231' }),
        overrideAccess: false,
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toMatchObject({ id: 1 })
  })

  it('parses the location field back into a structured object', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    await callPOST(validFields)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          location: { state: 'FL', city: 'Doral', propertyName: 'BePartnerLabs Test Property' },
        }),
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

  it('accepts a valid image photo and passes it through req.context, never as claim data', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    mockGetPayload.mockResolvedValue({ create } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const photo = fakeFile(FAKE_JPEG_BYTES, 'issue.jpg')
    const res = await callPOST(validFields, photo)

    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          photoFile: expect.objectContaining({ filename: 'issue.jpg', contentType: 'image/jpeg' }),
        },
      }),
    )
    const [call] = create.mock.calls
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

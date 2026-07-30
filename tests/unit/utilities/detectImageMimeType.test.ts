import { describe, expect, it } from 'vitest'
import { detectImageMimeType } from '@/utilities/detectImageMimeType'

/** Pads a signature out to the 12 bytes the sniffer needs before it will read. */
function withSignature(...bytes: number[]): Uint8Array {
  const out = new Uint8Array(16)
  out.set(bytes)
  return out
}

const ftyp = [0x66, 0x74, 0x79, 0x70]
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

describe('detectImageMimeType', () => {
  it('recognises a JPEG by its SOI marker', () => {
    expect(detectImageMimeType(withSignature(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg')
  })

  it('recognises a PNG', () => {
    expect(detectImageMimeType(withSignature(0x89, 0x50, 0x4e, 0x47))).toBe('image/png')
  })

  it('recognises a WEBP by the RIFF container plus the WEBP tag at offset 8', () => {
    const bytes = withSignature(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP'))
    expect(detectImageMimeType(bytes)).toBe('image/webp')
  })

  it.each(['heic', 'heix', 'mif1', 'msf1', 'heim', 'heis', 'hevc', 'hevx'])(
    'recognises the %s brand as HEIC',
    (brand) => {
      const bytes = withSignature(0, 0, 0, 0, ...ftyp, ...ascii(brand))
      expect(detectImageMimeType(bytes)).toBe('image/heic')
    },
  )

  it('rejects a RIFF container that is not a WEBP (e.g. a WAV)', () => {
    const bytes = withSignature(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WAVE'))
    expect(detectImageMimeType(bytes)).toBeNull()
  })

  it('rejects an ISO container whose brand is not in the HEIC family', () => {
    const bytes = withSignature(0, 0, 0, 0, ...ftyp, ...ascii('mp42'))
    expect(detectImageMimeType(bytes)).toBeNull()
  })

  it('rejects a Windows executable renamed to look like an image', () => {
    expect(detectImageMimeType(withSignature(0x4d, 0x5a, 0x90, 0x00))).toBeNull()
  })

  it('rejects anything shorter than a full signature rather than guessing', () => {
    expect(detectImageMimeType(new Uint8Array([0xff, 0xd8, 0xff]))).toBeNull()
  })

  it('rejects an empty buffer', () => {
    expect(detectImageMimeType(new Uint8Array([]))).toBeNull()
  })
})

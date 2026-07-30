// Sniffs the real file type from its magic bytes — never trust a client-supplied
// filename extension or `File.type`, both are trivially spoofable. Used to gate
// the claim-photo upload (src/app/(frontend)/next/claims-submit/route.ts) and
// form attachments before the bytes ever leave our server. Detecting a type is
// not the same as allowing it: each caller checks the result against its own
// allowlist.
const MAX_SIGNATURE_LENGTH = 12

export function detectImageMimeType(bytes: Uint8Array): string | null {
  if (bytes.length < MAX_SIGNATURE_LENGTH) return null

  // %PDF — the only non-image the sniffer knows. Form upload fields can opt
  // into it (see the `acceptedFileTypes` field in src/plugins/index.ts); the
  // claim-photo route keeps its own image-only allowlist.
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf'
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }

  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  if (isRiff && isWebp) {
    return 'image/webp'
  }

  // HEIC/HEIF: ISO base media file format "ftyp" box at offset 4, with a
  // HEIC-family brand (heic/heix/mif1/msf1/heim/heis/hevc/hevx) at offset 8.
  const isFtyp = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  if (isFtyp) {
    const brand = String.fromCharCode(bytes[8] ?? 0, bytes[9] ?? 0, bytes[10] ?? 0, bytes[11] ?? 0)
    if (['heic', 'heix', 'mif1', 'msf1', 'heim', 'heis', 'hevc', 'hevx'].includes(brand)) {
      return 'image/heic'
    }
  }

  return null
}

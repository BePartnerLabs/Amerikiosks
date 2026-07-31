/**
 * Which file types an editor may upload to `media`.
 *
 * SVG is in the default list because the client genuinely needs it: five of the
 * partner logos in production are SVG (Hilton, Royal Caribbean, SeaWorld…), and
 * a brand logo arriving as a vector is the normal case, not an edge case.
 *
 * It does carry a risk — media is served off the public CDN host with
 * `disablePayloadAccessControl`, so an SVG is fetched from our own origin and
 * executes there. Blocking it here would not remove that risk (five are already
 * being served) and would break a real workflow. The place it actually gets
 * closed is the bucket: a content-type policy or `Content-Disposition:
 * attachment` on the CDN hostname. Tracked in the roadmap.
 *
 * What the list still buys is keeping HTML, JavaScript and executables out —
 * types nothing here has any reason to hold.
 *
 * Override with `SUPPORTED_MEDIA_TYPES` (comma-separated mime types) to change
 * it from Vercel without shipping code — to drop SVG in a hurry, say, if an account is
 * ever compromised. Note the value is read when the Payload config is built, so
 * a change needs a redeploy to take effect.
 */
export const DEFAULT_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  // Straight off a phone: HEIC/HEIF is what an iPhone produces by default.
  'image/heic',
  'image/heif',
  'image/tiff',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
]

// Mime types rather than extensions on purpose: Payload validates against the
// file's real type, and an extension is the first thing anyone renames. The
// same call was already made on the other upload path — detectImageMimeType
// sniffs magic bytes precisely because a filename cannot be trusted.
export function resolveMediaMimeTypes(raw = process.env.SUPPORTED_MEDIA_TYPES): string[] {
  const declared = (raw ?? '')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)

  // An empty or whitespace-only override is a mistake, not an instruction to
  // accept nothing — an allowlist of zero types would reject every upload.
  return declared.length > 0 ? declared : DEFAULT_MEDIA_MIME_TYPES
}

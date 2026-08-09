/**
 * Public URL for one frame of a turntable sequence.
 *
 * Deliberately not `buildPublicFileURL`. That helper prepends `S3_BUCKET`
 * because Payload's storage plugin keeps every Media file under a
 * `<bucket-name>/` prefix inside the bucket. Frame sequences are not Media
 * documents — they are uploaded by hand or by
 * `scripts/build-frame-sequence.mjs` and addressed by convention — so they live
 * at the bucket root, one folder per machine:
 *
 *   https://cdn.amerikiosks.com/gamma-12/v0.01/frame-001.webp
 *
 * Keeping them out of Payload's prefix is the point: they are not managed by
 * Media, they should not appear in its browser, and mixing them in would put
 * sixty files per machine in front of an editor looking for a photo.
 *
 * The version lives in the path, never in a `?v=` query. These URLs bypass
 * `getMediaUrl`, so they carry no cache tag; overwriting a folder would leave
 * the CDN serving half the old animation and half the new one, per edge node,
 * unreproducible locally. A new version is a new folder is a new URL.
 */
export const buildFrameSequenceURL = (sequencePath: string, frame: number): string => {
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? process.env.S3_PUBLIC_URL
  const host = base?.replace(/\/+$/, '') ?? ''
  const prefix = sequencePath.replace(/^\/+|\/+$/g, '')

  return `${host}/${prefix}/frame-${String(frame).padStart(3, '0')}.webp`
}

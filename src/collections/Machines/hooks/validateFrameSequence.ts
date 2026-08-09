import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Guards the frame-sequence pointer, which is a convention the database cannot
 * enforce: `sequencePath` is free text and the frames live in R2, so nothing
 * else notices a typo until the hero renders nothing.
 *
 * The rule that matters most is the last one. Frame URLs are composed by
 * convention and never pass through `getMediaUrl`, so they carry no `?v=` cache
 * tag. Re-uploading into an existing folder leaves the CDN serving some old
 * frames and some new ones — a broken animation that depends on which edge node
 * a visitor hits, and that never reproduces locally. The version lives in the
 * path (`gamma-12/v0.1`) precisely so a new sequence is a new URL.
 *
 * See docs/patterns/ and openspec/changes/machine-page-blocks/design.md.
 */
export const validateFrameSequence: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data?.useRotationHero) return data

  const path = typeof data.sequencePath === 'string' ? data.sequencePath.trim() : ''
  const count = typeof data.frameCount === 'number' ? data.frameCount : null

  // Nothing declared yet: the legacy `rotationFrames` array may still be
  // feeding the hero, so an empty pointer is not an error on its own.
  if (!path && count === null) return data

  if (!path || count === null) {
    throw new Error(
      'A frame sequence needs both "sequencePath" and "frameCount". One without the other renders nothing.',
    )
  }

  // `gamma-12/v0.1` — a machine folder and a version, nothing else. A leading
  // or trailing slash silently produces a double slash in the URL, and the
  // bucket treats that as a different key.
  if (!/^[a-z0-9][a-z0-9-]*\/v\d+(\.\d+)?$/.test(path)) {
    throw new Error(
      `"${path}" is not a valid sequence path. Expected "<machine>/v<version>", e.g. "gamma-12/v0.1" — lowercase, no leading or trailing slash.`,
    )
  }

  if (count < 2) {
    throw new Error('A sequence needs at least 2 frames.')
  }

  // The one that catches the expensive mistake: frames changed, folder did not.
  const previousPath =
    typeof originalDoc?.sequencePath === 'string' ? originalDoc.sequencePath.trim() : ''
  const previousCount = typeof originalDoc?.frameCount === 'number' ? originalDoc.frameCount : null

  if (previousPath && previousPath === path && previousCount !== null && previousCount !== count) {
    throw new Error(
      `The frame count changed (${previousCount} → ${count}) but "${path}" is the same folder. ` +
        'Re-uploading over a version leaves the CDN serving half the old animation and half the new one. ' +
        'Upload a new folder and bump the version instead.',
    )
  }

  return data
}

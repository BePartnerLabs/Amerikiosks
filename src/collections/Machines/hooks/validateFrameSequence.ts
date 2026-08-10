import type { CollectionBeforeValidateHook } from 'payload'
import { buildFrameSequenceURL } from '@/utilities/buildFrameSequenceURL'

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
export const validateFrameSequence: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
}) => {
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
  const countChangedOnSameFolder =
    Boolean(previousPath) &&
    previousPath === path &&
    previousCount !== null &&
    previousCount !== count

  if (!countChangedOnSameFolder) return data

  // Antes de rechazar, se le pregunta al bucket. La regla de arriba es una
  // conjetura: "cambio el conteo sin cambiar la carpeta" casi siempre significa
  // que alguien resubio encima de una version, pero tambien es lo que se ve
  // cuando el conteo estaba mal escrito desde el principio y los archivos nunca
  // se tocaron. Eso paso con gamma-13/v0.03: 90 fotogramas subidos, 60 tecleados
  // en /admin, y el guard impidiendo corregir el numero equivocado.
  //
  // El bucket sabe cual de las dos es. Si el fotograma N existe y el N+1 no, el
  // conteo nuevo describe exactamente lo que hay subido y no hay nada que
  // proteger. Deja de ser una heuristica y pasa a ser una comprobacion.
  const verdict = await countMatchesBucket(path, count)

  if (verdict === 'matches') return data

  throw new Error(
    verdict === 'mismatch'
      ? `The frame count changed (${previousCount} → ${count}) and "${path}" does not hold ${count} frames. ` +
          `Check what is actually uploaded, or upload a new folder and bump the version.`
      : `The frame count changed (${previousCount} → ${count}) but "${path}" is the same folder, ` +
          'and the bucket could not be reached to confirm what is in it. ' +
          'Re-uploading over a version leaves the CDN serving half the old animation and half the new one. ' +
          'If the files never changed and only the number was wrong, clear both fields, save, and set them again. ' +
          'Otherwise upload a new folder and bump the version.',
  )
}

/**
 * Does `path` hold exactly `count` frames?
 *
 * `matches` solo si el fotograma `count` existe y el `count + 1` no. Comprobar
 * unicamente que el ultimo existe dejaria pasar un conteo corto —el caso real:
 * 60 declarados sobre 90 subidos, que recorta la animacion a dos tercios sin
 * dar error en ninguna parte.
 *
 * `unknown` cuando no se puede saber: sin host configurado, red caida, o el
 * bucket respondiendo algo que no es 200 ni 404. Ante la duda no se afirma
 * nada y la decision vuelve a la regla conservadora.
 */
const countMatchesBucket = async (
  path: string,
  count: number,
): Promise<'matches' | 'mismatch' | 'unknown'> => {
  if (!(process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? process.env.S3_PUBLIC_URL)) return 'unknown'

  try {
    const [last, beyond] = await Promise.all([
      fetch(buildFrameSequenceURL(path, count), { method: 'HEAD' }),
      fetch(buildFrameSequenceURL(path, count + 1), { method: 'HEAD' }),
    ])
    if (!last.ok && last.status !== 404) return 'unknown'
    if (!beyond.ok && beyond.status !== 404) return 'unknown'
    return last.ok && beyond.status === 404 ? 'matches' : 'mismatch'
  } catch {
    return 'unknown'
  }
}

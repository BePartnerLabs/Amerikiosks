import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { validateFrameSequence } from '@/collections/Machines/hooks/validateFrameSequence'

const run = (data: Record<string, unknown>, originalDoc?: Record<string, unknown>) =>
  (validateFrameSequence as (args: unknown) => Promise<unknown>)({ data, originalDoc })

/**
 * El bucket, simulado por su contenido real: `frames` es cuántos fotogramas hay
 * subidos en esa carpeta, y el fetch responde 200 o 404 según el número que se
 * le pida. Es lo que el hook consulta antes de rechazar una corrección.
 */
const bucketWith = (folders: Record<string, number>) => {
  // Las dos: `buildFrameSequenceURL` prefiere la NEXT_PUBLIC_ y usa `??`, asi
  // que una cadena vacia gana sobre la otra en vez de caer a ella.
  vi.stubEnv('NEXT_PUBLIC_S3_PUBLIC_URL', 'https://cdn.test')
  vi.stubEnv('S3_PUBLIC_URL', 'https://cdn.test')
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const match = /https:\/\/cdn\.test\/(.+)\/frame-(\d+)\.webp$/.exec(url)
      if (!match) return { ok: false, status: 404 }
      const uploaded = folders[match[1]]
      const asked = Number(match[2])
      const exists = uploaded !== undefined && asked <= uploaded
      return { ok: exists, status: exists ? 200 : 404 }
    }),
  )
}

/** Sin host configurado no hay a quién preguntar. */
const bucketUnreachable = () => {
  vi.stubEnv('S3_PUBLIC_URL', '')
  vi.stubEnv('NEXT_PUBLIC_S3_PUBLIC_URL', '')
}

describe('validateFrameSequence', () => {
  beforeEach(bucketUnreachable)
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('ignores machines that do not use the rotation hero', async () => {
    await expect(run({ useRotationHero: false, sequencePath: 'nonsense!!' })).resolves.toBeDefined()
  })

  it('allows an empty pointer — the legacy rotationFrames array may still feed the hero', async () => {
    await expect(run({ useRotationHero: true })).resolves.toBeDefined()
  })

  it('accepts a well-formed path and count', async () => {
    await expect(
      run({ useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 60 }),
    ).resolves.toBeDefined()
  })

  it('rejects a path without its count, which would render nothing', async () => {
    await expect(run({ useRotationHero: true, sequencePath: 'gamma-12/v0.1' })).rejects.toThrow(
      /both/,
    )
  })

  it('rejects a path with a leading or trailing slash, which doubles up in the URL', async () => {
    await expect(
      run({ useRotationHero: true, sequencePath: '/gamma-12/v1', frameCount: 60 }),
    ).rejects.toThrow(/not a valid sequence path/)
    await expect(
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1/', frameCount: 60 }),
    ).rejects.toThrow(/not a valid sequence path/)
  })

  it('rejects a path with no version segment', async () => {
    await expect(
      run({ useRotationHero: true, sequencePath: 'gamma-12', frameCount: 60 }),
    ).rejects.toThrow(/not a valid sequence path/)
  })

  it('accepts both v1 and v0.1', async () => {
    await expect(
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1', frameCount: 60 }),
    ).resolves.toBeDefined()
    await expect(
      run({ useRotationHero: true, sequencePath: 'alpha-10/v0.2', frameCount: 36 }),
    ).resolves.toBeDefined()
  })

  it('rejects a sequence of one frame', async () => {
    await expect(
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1', frameCount: 1 }),
    ).rejects.toThrow(/at least 2 frames/)
  })

  it('allows a changed frame count when the version moved with it', async () => {
    await expect(
      run(
        { useRotationHero: true, sequencePath: 'gamma-12/v0.2', frameCount: 72 },
        { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
      ),
    ).resolves.toBeDefined()
  })

  it('allows re-saving a document without touching the sequence', async () => {
    await expect(
      run(
        { useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 60 },
        { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
      ),
    ).resolves.toBeDefined()
  })

  describe('cuando cambia el conteo sobre la misma carpeta', () => {
    // La conjetura de siempre: mismo folder y otro conteo suele significar que
    // alguien resubio encima de una version, y sin cache tag eso deja al CDN
    // sirviendo media animacion vieja y media nueva segun el nodo edge.
    it('rejects it when the bucket cannot be reached to confirm', async () => {
      await expect(
        run(
          { useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 72 },
          { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
        ),
      ).rejects.toThrow(/half the old animation/)
    })

    // El caso real que el guard impedia arreglar: 90 fotogramas subidos, 60
    // tecleados en /admin. Los archivos nunca se tocaron; lo que estaba mal era
    // el numero, y corregirlo no pone en riesgo ninguna cache.
    it('allows the correction when the bucket holds exactly the new count', async () => {
      bucketWith({ 'gamma-13/v0.03': 90 })
      await expect(
        run(
          { useRotationHero: true, sequencePath: 'gamma-13/v0.03', frameCount: 90 },
          { sequencePath: 'gamma-13/v0.03', frameCount: 60 },
        ),
      ).resolves.toBeDefined()
    })

    it('rejects a count the bucket does not back — too high', async () => {
      bucketWith({ 'gamma-13/v0.03': 90 })
      await expect(
        run(
          { useRotationHero: true, sequencePath: 'gamma-13/v0.03', frameCount: 120 },
          { sequencePath: 'gamma-13/v0.03', frameCount: 60 },
        ),
      ).rejects.toThrow(/does not hold 120 frames/)
    })

    // Comprobar solo que el ultimo existe dejaria pasar esto, y un conteo corto
    // recorta la animacion sin dar error en ninguna parte: el scroll llega al
    // final con la maquina congelada.
    it('rejects a count the bucket does not back — too low', async () => {
      bucketWith({ 'gamma-13/v0.03': 90 })
      await expect(
        run(
          { useRotationHero: true, sequencePath: 'gamma-13/v0.03', frameCount: 45 },
          { sequencePath: 'gamma-13/v0.03', frameCount: 60 },
        ),
      ).rejects.toThrow(/does not hold 45 frames/)
    })
  })
})

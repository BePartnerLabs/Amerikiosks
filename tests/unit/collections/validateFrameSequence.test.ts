import { describe, expect, it } from 'vitest'
import { validateFrameSequence } from '@/collections/Machines/hooks/validateFrameSequence'

const run = (data: Record<string, unknown>, originalDoc?: Record<string, unknown>) =>
  (validateFrameSequence as (args: unknown) => unknown)({ data, originalDoc }) as unknown

describe('validateFrameSequence', () => {
  it('ignores machines that do not use the rotation hero', () => {
    expect(() => run({ useRotationHero: false, sequencePath: 'nonsense!!' })).not.toThrow()
  })

  it('allows an empty pointer — the legacy rotationFrames array may still feed the hero', () => {
    expect(() => run({ useRotationHero: true })).not.toThrow()
  })

  it('accepts a well-formed path and count', () => {
    expect(() =>
      run({ useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 60 }),
    ).not.toThrow()
  })

  it('rejects a path without its count, which would render nothing', () => {
    expect(() => run({ useRotationHero: true, sequencePath: 'gamma-12/v0.1' })).toThrow(/both/)
  })

  it('rejects a path with a leading or trailing slash, which doubles up in the URL', () => {
    expect(() =>
      run({ useRotationHero: true, sequencePath: '/gamma-12/v1', frameCount: 60 }),
    ).toThrow(/not a valid sequence path/)
    expect(() =>
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1/', frameCount: 60 }),
    ).toThrow(/not a valid sequence path/)
  })

  it('rejects a path with no version segment', () => {
    expect(() => run({ useRotationHero: true, sequencePath: 'gamma-12', frameCount: 60 })).toThrow(
      /not a valid sequence path/,
    )
  })

  it('accepts both v1 and v0.1', () => {
    expect(() =>
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1', frameCount: 60 }),
    ).not.toThrow()
    expect(() =>
      run({ useRotationHero: true, sequencePath: 'alpha-10/v0.2', frameCount: 36 }),
    ).not.toThrow()
  })

  it('rejects a sequence of one frame', () => {
    expect(() =>
      run({ useRotationHero: true, sequencePath: 'gamma-12/v1', frameCount: 1 }),
    ).toThrow(/at least 2 frames/)
  })

  // The expensive one: overwriting a version leaves the CDN serving a mixture,
  // per edge node, and it never reproduces locally.
  it('rejects a changed frame count on an unchanged folder', () => {
    expect(() =>
      run(
        { useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 72 },
        { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
      ),
    ).toThrow(/half the old animation/)
  })

  it('allows a changed frame count when the version moved with it', () => {
    expect(() =>
      run(
        { useRotationHero: true, sequencePath: 'gamma-12/v0.2', frameCount: 72 },
        { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
      ),
    ).not.toThrow()
  })

  it('allows re-saving a document without touching the sequence', () => {
    expect(() =>
      run(
        { useRotationHero: true, sequencePath: 'gamma-12/v0.1', frameCount: 60 },
        { sequencePath: 'gamma-12/v0.1', frameCount: 60 },
      ),
    ).not.toThrow()
  })
})

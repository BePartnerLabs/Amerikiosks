import type { CollectionAfterChangeHook } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }))

import { revalidateFormGlobals } from '@/collections/Forms/hooks/revalidateFormGlobals'

const logger = { info: vi.fn() }

function run(context: Record<string, unknown> = {}) {
  const doc = { id: 7, title: 'Start a Partnership' }
  return (revalidateFormGlobals as CollectionAfterChangeHook)({
    doc,
    req: { payload: { logger }, context },
  } as unknown as Parameters<CollectionAfterChangeHook>[0])
}

describe('revalidateFormGlobals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // The header/footer cache entries hold the form *populated*, so editing a
  // form is invisible to them until their own tag is busted.
  it('busts the header and footer tags when a form changes', () => {
    run()

    expect(revalidateTag).toHaveBeenCalledTimes(2)
    expect(revalidateTag).toHaveBeenCalledWith('global_header', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('global_footer', 'max')
  })

  it('does nothing when the caller opted out of revalidation', () => {
    run({ disableRevalidate: true })

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('returns the document unchanged so it stays usable as an afterChange hook', () => {
    const result = run()

    expect(result).toEqual({ id: 7, title: 'Start a Partnership' })
  })
})

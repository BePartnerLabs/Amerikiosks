import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

describe('revalidateHeader', () => {
  it('revalidates the header tag when disableRevalidate is not set', async () => {
    const { revalidateHeader } = await import('@/Header/hooks/revalidateHeader')
    const { revalidateTag } = await import('next/cache')
    const info = vi.fn()
    const doc = { id: 1 }

    const result = revalidateHeader({
      doc,
      req: { payload: { logger: { info } }, context: {} },
    } as never)

    expect(result).toBe(doc)
    expect(info).toHaveBeenCalledWith('Revalidating header')
    expect(revalidateTag).toHaveBeenCalledWith('global_header', 'max')
  })

  it('skips revalidation when context.disableRevalidate is true', async () => {
    const { revalidateHeader } = await import('@/Header/hooks/revalidateHeader')
    const { revalidateTag } = await import('next/cache')
    vi.mocked(revalidateTag).mockClear()
    const doc = { id: 1 }

    const result = revalidateHeader({
      doc,
      req: { payload: { logger: { info: vi.fn() } }, context: { disableRevalidate: true } },
    } as never)

    expect(result).toBe(doc)
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('revalidateFooter', () => {
  it('revalidates the footer tag when disableRevalidate is not set', async () => {
    const { revalidateFooter } = await import('@/Footer/hooks/revalidateFooter')
    const { revalidateTag } = await import('next/cache')
    vi.mocked(revalidateTag).mockClear()
    const info = vi.fn()
    const doc = { id: 1 }

    const result = revalidateFooter({
      doc,
      req: { payload: { logger: { info } }, context: {} },
    } as never)

    expect(result).toBe(doc)
    expect(info).toHaveBeenCalledWith('Revalidating footer')
    expect(revalidateTag).toHaveBeenCalledWith('global_footer', 'max')
  })

  it('skips revalidation when context.disableRevalidate is true', async () => {
    const { revalidateFooter } = await import('@/Footer/hooks/revalidateFooter')
    const { revalidateTag } = await import('next/cache')
    vi.mocked(revalidateTag).mockClear()

    const result = revalidateFooter({
      doc: { id: 1 },
      req: { payload: { logger: { info: vi.fn() } }, context: { disableRevalidate: true } },
    } as never)

    expect(result).toEqual({ id: 1 })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

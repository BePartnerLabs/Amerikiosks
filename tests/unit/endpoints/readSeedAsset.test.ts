import { afterEach, describe, expect, it, vi } from 'vitest'
import { readSeedAsset } from '@/endpoints/seed/uploadMedia'

describe('readSeedAsset', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads an existing asset from public/seed-assets without fetching', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const data = await readSeedAsset('image-post1.webp')

    expect(data.length).toBeGreaterThan(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('falls back to HTTP fetch when the asset is not on disk', async () => {
    const payload = new Uint8Array([1, 2, 3]).buffer
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(payload),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const data = await readSeedAsset('not-on-disk.png')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/seed-assets\/not-on-disk\.png$/)
    expect([...data]).toEqual([1, 2, 3])
  })

  it('throws when the asset is missing on disk and the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(readSeedAsset('not-on-disk.png')).rejects.toThrow(/Failed to fetch seed asset/)
  })
})

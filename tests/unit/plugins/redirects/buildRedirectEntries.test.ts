import { describe, expect, it, vi } from 'vitest'
import { buildRedirectEntries, type RedirectDoc } from '@/plugins/redirects/getRedirectEntries'

const noPages = new Set<string>()

describe('buildRedirectEntries', () => {
  it('normalizes from and keeps a custom url destination', () => {
    const docs: RedirectDoc[] = [{ id: 1, from: '/cart/', to: { url: '/' } }]

    expect(buildRedirectEntries(docs, noPages)).toEqual([{ from: '/cart', to: '/', status: 301 }])
  })

  it('resolves a reference destination to its slug', () => {
    const docs: RedirectDoc[] = [
      {
        id: 1,
        from: 'old-page',
        to: { reference: { relationTo: 'pages', value: { slug: 'home' } } },
      },
    ]

    expect(buildRedirectEntries(docs, noPages)).toEqual([
      { from: '/old-page', to: '/home', status: 301 },
    ])
  })

  it('prefixes the collection for non-page references', () => {
    const docs: RedirectDoc[] = [
      {
        id: 1,
        from: '/old-post',
        to: { reference: { relationTo: 'insights', value: { slug: 'launch' } } },
      },
    ]

    expect(buildRedirectEntries(docs, noPages)[0].to).toBe('/insights/launch')
  })

  it('honours a 302', () => {
    const docs: RedirectDoc[] = [{ id: 1, from: '/x', type: '302', to: { url: '/y' } }]

    expect(buildRedirectEntries(docs, noPages)[0].status).toBe(302)
  })

  it('drops rows with no destination instead of redirecting to /undefined', () => {
    const onSkip = vi.fn()
    const docs: RedirectDoc[] = [
      { id: 1, from: '/orphan', to: { reference: { relationTo: 'pages', value: 99 } } },
      { id: 2, from: '/empty' },
    ]

    expect(buildRedirectEntries(docs, noPages, onSkip)).toEqual([])
    // id 1's reference came back unpopulated (just an id), id 2 has no `to` at all
    expect(onSkip).toHaveBeenCalledTimes(2)
  })

  it('never lets a redirect shadow a published page', () => {
    const onSkip = vi.fn()
    const docs: RedirectDoc[] = [{ id: 18, from: 'contact', to: { url: '/home' } }]

    expect(buildRedirectEntries(docs, new Set(['/contact']), onSkip)).toEqual([])
    expect(onSkip).toHaveBeenCalledWith(expect.stringContaining('is a published page'))
  })

  it('drops a redirect that points at itself', () => {
    const onSkip = vi.fn()
    const docs: RedirectDoc[] = [{ id: 1, from: '/loop/', to: { url: '/loop' } }]

    expect(buildRedirectEntries(docs, noPages, onSkip)).toEqual([])
    expect(onSkip).toHaveBeenCalledWith(expect.stringContaining('points at itself'))
  })
})

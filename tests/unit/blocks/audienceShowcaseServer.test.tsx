import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

const findByIDMock = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ findByID: findByIDMock }) }))
vi.mock('next-intl/server', () => ({ getLocale: async () => 'es' }))

// The block itself is rendered elsewhere; here what matters is what the server
// half fetches and with whose permissions.
vi.mock('@/blocks/AudienceShowcase/Component', () => ({
  AudienceShowcaseBlock: (props: { items?: unknown[] }) => (
    <div data-testid="block">{JSON.stringify(props.items ?? [])}</div>
  ),
}))

import { AudienceShowcaseServer } from '@/blocks/AudienceShowcase/Server'

afterEach(() => {
  vi.clearAllMocks()
})

async function renderServer(props: Record<string, unknown>) {
  const ui = await AudienceShowcaseServer(props as never)
  return render(ui as React.ReactElement)
}

describe('AudienceShowcaseServer', () => {
  // Reading with a visitor's permissions is what keeps unpublished content and
  // gated fields out of the page — the Local API defaults to overriding access.
  it('reads related documents with overrideAccess: false', async () => {
    findByIDMock.mockResolvedValue({ id: 5, title: 'A page' })
    await renderServer({ items: [{ target: 'page', page: 5 }] })

    expect(findByIDMock).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false }))
  })

  it('reads pages in the request locale', async () => {
    findByIDMock.mockResolvedValue({ id: 5 })
    await renderServer({ items: [{ target: 'page', page: 5 }] })

    expect(findByIDMock).toHaveBeenCalledWith(expect.objectContaining({ locale: 'es' }))
  })

  // A relationship arrives as a number, a numeric string or an already-populated
  // object depending on depth and on where it came from.
  it('coerces a string page id to a number', async () => {
    findByIDMock.mockResolvedValue({ id: 5 })
    await renderServer({ items: [{ target: 'page', page: '5' }] })

    expect(findByIDMock).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }))
  })

  it('takes the id out of an already-populated page', async () => {
    findByIDMock.mockResolvedValue({ id: 9 })
    await renderServer({ items: [{ target: 'page', page: { id: 9, slug: 'x' } }] })

    expect(findByIDMock).toHaveBeenCalledWith(expect.objectContaining({ id: 9 }))
  })

  it('fetches a form when the item targets one', async () => {
    findByIDMock.mockResolvedValue({ id: 3, title: 'Contact' })
    await renderServer({ items: [{ target: 'form', form: 3 }] })

    expect(findByIDMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'forms', id: 3, overrideAccess: false }),
    )
  })

  // Already populated: re-fetching would be a query for data we hold.
  it('does not re-fetch a form that arrived populated', async () => {
    await renderServer({ items: [{ target: 'form', form: { id: 3, title: 'Contact' } }] })
    expect(findByIDMock).not.toHaveBeenCalled()
  })

  it('queries nothing when there are no items', async () => {
    await renderServer({ items: [] })
    expect(findByIDMock).not.toHaveBeenCalled()
  })

  it('leaves an item with no target document alone', async () => {
    await renderServer({ items: [{ target: 'page' }] })
    expect(findByIDMock).not.toHaveBeenCalled()
  })
})

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

const { find } = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

vi.mock('@/components/CollectionArchive', () => ({
  CollectionArchive: ({ posts }: { posts: { id: number }[] }) => (
    <div data-testid="archive">{posts.map((p) => p.id).join(',')}</div>
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'

const introContent = {
  root: { type: 'root', children: [], direction: null, format: '' as const, indent: 0, version: 1 },
}

describe('ArchiveBlock', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
  })

  it('fetches posts from the insights collection when populateBy is "collection"', async () => {
    find.mockResolvedValue({ docs: [{ id: 1 }, { id: 2 }] })

    const ui = await ArchiveBlock({
      blockType: 'archive',
      populateBy: 'collection',
      limit: 4,
    } as never)
    render(ui)

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'insights', limit: 4 }))
    expect(screen.getByTestId('archive')).toHaveTextContent('1,2')
  })

  it('filters by category ids when categories are provided', async () => {
    find.mockResolvedValue({ docs: [] })

    await ArchiveBlock({
      blockType: 'archive',
      populateBy: 'collection',
      categories: [{ id: 'cat-1', title: 'Retail' } as never],
    } as never)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { categories: { in: ['cat-1'] } } }),
    )
  })

  it('uses selectedDocs directly when populateBy is not "collection"', async () => {
    const ui = await ArchiveBlock({
      blockType: 'archive',
      populateBy: 'selection',
      selectedDocs: [{ relationTo: 'insights', value: { id: 9 } as never }],
    } as never)
    render(ui)

    expect(find).not.toHaveBeenCalled()
    expect(screen.getByTestId('archive')).toHaveTextContent('9')
  })

  it('renders intro content when provided', async () => {
    const ui = await ArchiveBlock({
      blockType: 'archive',
      populateBy: 'selection',
      selectedDocs: [],
      introContent,
    } as never)
    render(ui)

    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })
})

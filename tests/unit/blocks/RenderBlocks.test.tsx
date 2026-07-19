import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/blocks/ArchiveBlock/Component', () => ({ ArchiveBlock: () => <div>archive</div> }))
vi.mock('@/blocks/AudienceShowcase/Server', () => ({
  AudienceShowcaseServer: () => <div>audienceShowcase</div>,
}))
vi.mock('@/blocks/CallToAction/Component', () => ({ CallToActionBlock: () => <div>cta</div> }))
vi.mock('@/blocks/CardGrid/Component', () => ({ CardGridBlock: () => <div>cardGrid</div> }))
vi.mock('@/blocks/Content/Component', () => ({ ContentBlock: () => <div>content</div> }))
vi.mock('@/blocks/FAQWithForm/Server', () => ({ FAQWithFormServer: () => <div>faqWithForm</div> }))
vi.mock('@/blocks/Form/Component', () => ({ FormBlock: () => <div>formBlock</div> }))
vi.mock('@/blocks/FormatsGrid/Server', () => ({ FormatsGridServer: () => <div>formatsGrid</div> }))
vi.mock('@/blocks/InsightsShowcase/Component', () => ({
  InsightsShowcaseBlock: () => <div>insightsShowcase</div>,
}))
vi.mock('@/blocks/MachinesListing/Server', () => ({
  MachinesListingServer: () => <div>machinesListing</div>,
}))
vi.mock('@/blocks/MediaBlock/Component', () => ({ MediaBlock: () => <div>mediaBlock</div> }))
vi.mock('@/blocks/ProcessSteps/Component', () => ({
  ProcessStepsBlock: () => <div>processSteps</div>,
}))
vi.mock('@/blocks/ProjectsShowcase/Component', () => ({
  ProjectsShowcaseBlock: () => <div>projectsShowcase</div>,
}))
vi.mock('@/blocks/TrustStrip/Server', () => ({ TrustStripServer: () => <div>trustStrip</div> }))

import { RenderBlocks } from '@/blocks/RenderBlocks'
import type { Page } from '@/payload-types'

describe('RenderBlocks', () => {
  afterEach(cleanup)

  it('renders nothing when blocks is empty', () => {
    const { container } = render(<RenderBlocks blocks={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when blocks is not an array', () => {
    const { container } = render(<RenderBlocks blocks={null as never} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the matching component for a known blockType', () => {
    render(
      <RenderBlocks
        blocks={[{ blockType: 'cta', id: '1' }] as unknown as NonNullable<Page['layout']>}
      />,
    )
    expect(screen.getByText('cta')).toBeInTheDocument()
  })

  it('renders multiple blocks in order', () => {
    render(
      <RenderBlocks
        blocks={
          [
            { blockType: 'content', id: '1' },
            { blockType: 'mediaBlock', id: '2' },
          ] as unknown as NonNullable<Page['layout']>
        }
      />,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.getByText('mediaBlock')).toBeInTheDocument()
  })

  it('skips blocks with an unrecognized blockType', () => {
    render(
      <RenderBlocks
        blocks={[{ blockType: 'notARealBlock', id: '1' }] as unknown as NonNullable<Page['layout']>}
      />,
    )
    expect(screen.queryByText(/./)).toBeNull()
  })

  it('skips a block whose blockName is exactly "hidden"', () => {
    render(
      <RenderBlocks
        blocks={
          [{ blockType: 'cta', blockName: 'Hidden', id: '1' }] as unknown as NonNullable<
            Page['layout']
          >
        }
      />,
    )
    expect(screen.queryByText('cta')).toBeNull()
  })

  it('renders a block whose blockName merely contains "hidden"', () => {
    render(
      <RenderBlocks
        blocks={
          [
            { blockType: 'cta', blockName: 'Hidden promo (old)', id: '1' },
          ] as unknown as NonNullable<Page['layout']>
        }
      />,
    )
    expect(screen.getByText('cta')).toBeInTheDocument()
  })
})

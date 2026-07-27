import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TrustStripBlock, type TrustStripPartner } from '@/blocks/TrustStrip/Component'
import type { Page } from '@/payload-types'

type TrustStripType = Extract<NonNullable<Page['layout']>[number], { blockType: 'trustStrip' }>

const mockPartners: TrustStripPartner[] = [
  { id: 1, name: 'Hilton', logo: { url: '/hilton.png', alt: 'Hilton' }, order: 1 },
  { id: 2, name: 'CVS', logo: { url: '/cvs.png', alt: 'CVS' }, order: 2 },
  { id: 3, name: 'Kroger', logo: { url: '/kroger.png', alt: 'Kroger' }, order: 3 },
]

const base: TrustStripType & { partners: TrustStripPartner[] } = {
  blockType: 'trustStrip',
  blockName: '',
  id: 'ts-1',
  eyebrow: 'WHO WE WORK WITH',
  heading: 'Trusted by Leading Brands and Venues',
  limit: 0,
  partners: mockPartners,
}

describe('TrustStripBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getByRole('region', { name: /trusted by leading brands/i })).toBeInTheDocument()
  })

  it('renders eyebrow text', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getByText('WHO WE WORK WITH')).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getByRole('heading', { name: /trusted by leading brands/i })).toBeInTheDocument()
  })

  it('renders all partner names as alt text', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getAllByAltText('Hilton')).not.toHaveLength(0)
    expect(screen.getAllByAltText('CVS')).not.toHaveLength(0)
    expect(screen.getAllByAltText('Kroger')).not.toHaveLength(0)
  })

  it('hides eyebrow when not provided', () => {
    render(
      <TrustStripBlock
        {...base}
        eyebrow=""
      />,
    )
    expect(screen.queryByText('WHO WE WORK WITH')).toBeNull()
  })

  it('renders duplicate tracks for seamless loop in both rows', () => {
    const { container } = render(<TrustStripBlock {...base} />)
    const rows = container.querySelectorAll('.ak-trust-strip__row')
    expect(rows).toHaveLength(2)
    const tracks = container.querySelectorAll('.ak-trust-strip__track')
    expect(tracks).toHaveLength(4)
  })
})

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MachineHero } from '@/components/MachineHero'
import type { Machine } from '@/payload-types'

vi.mock('@/components/MachineHero/ZoomFadeHero', () => ({
  ZoomFadeHero: ({ heading }: { heading: string }) => (
    <div data-testid="zoom-fade-hero">{heading}</div>
  ),
}))

vi.mock('@/components/MachineHero/RotationScrubHero', () => ({
  RotationScrubHero: ({ heading, frameUrls }: { heading: string; frameUrls: string[] }) => (
    <div data-testid="rotation-scrub-hero">
      {heading}:{frameUrls.length}
    </div>
  ),
}))

const baseMachine = {
  id: 'm1',
  slug: 'turntable-kiosk',
  name: 'Turntable Kiosk',
  tagline: 'Spin to win',
  image: { id: 'img1', url: '/turntable.jpg' },
  tags: [],
  layout: [],
  updatedAt: '',
  createdAt: '',
} as unknown as Machine

describe('MachineHero', () => {
  afterEach(cleanup)

  it('renders ZoomFadeHero by default (useRotationHero false)', () => {
    render(<MachineHero machine={{ ...baseMachine, useRotationHero: false, rotationFrames: [] }} />)
    expect(screen.getByTestId('zoom-fade-hero')).toHaveTextContent('Turntable Kiosk')
    expect(screen.queryByTestId('rotation-scrub-hero')).not.toBeInTheDocument()
  })

  it('renders RotationScrubHero when useRotationHero is true and frames exist', () => {
    render(
      <MachineHero
        machine={
          {
            ...baseMachine,
            useRotationHero: true,
            rotationFrames: [
              { id: 'f1', image: { id: 'fr1', url: '/f1.jpg' } },
              { id: 'f2', image: { id: 'fr2', url: '/f2.jpg' } },
            ],
          } as unknown as Machine
        }
      />,
    )
    expect(screen.getByTestId('rotation-scrub-hero')).toHaveTextContent('Turntable Kiosk:2')
    expect(screen.queryByTestId('zoom-fade-hero')).not.toBeInTheDocument()
  })

  it('falls back to ZoomFadeHero when useRotationHero is true but rotationFrames is empty', () => {
    render(<MachineHero machine={{ ...baseMachine, useRotationHero: true, rotationFrames: [] }} />)
    expect(screen.getByTestId('zoom-fade-hero')).toBeInTheDocument()
    expect(screen.queryByTestId('rotation-scrub-hero')).not.toBeInTheDocument()
  })
})

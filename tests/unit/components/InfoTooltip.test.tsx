import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { InfoTooltip } from '@/components/ConsentBanner/InfoTooltip'

describe('InfoTooltip', () => {
  afterEach(cleanup)

  it('renders a trigger with the given accessible label and a tooltip with the description, linked via aria-describedby', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    expect(trigger).toHaveAttribute('aria-describedby', 'test-tooltip')

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveAttribute('id', 'test-tooltip')
    expect(tooltip).toHaveTextContent('X is used for Y.')
  })

  it('adds the start-placement class when the tooltip would overflow the left edge', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    const tooltip = screen.getByRole('tooltip')

    // jsdom's getBoundingClientRect returns all-zero rects by default, so
    // rect.left (0) is always < the 8px margin — this deterministically
    // exercises the "start" placement branch without needing a manual mock.
    fireEvent.focus(trigger)
    expect(tooltip).toHaveClass('bp-tooltip--start')
  })

  it('recomputes placement to end when the tooltip would overflow the right edge', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    const tooltip = screen.getByRole('tooltip')

    const originalGetBoundingClientRect = tooltip.getBoundingClientRect.bind(tooltip)
    tooltip.getBoundingClientRect = () =>
      ({ ...originalGetBoundingClientRect(), left: 100, right: 5000, top: 100 }) as DOMRect
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })

    fireEvent.mouseEnter(trigger)
    expect(tooltip).toHaveClass('bp-tooltip--end')
  })

  it('closes on Escape by blurring the trigger', () => {
    render(
      <InfoTooltip
        id="test-tooltip"
        label="More about X"
        description="X is used for Y."
      />,
    )
    const trigger = screen.getByRole('button', { name: 'More about X' })
    trigger.focus()
    expect(trigger).toHaveFocus()
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).not.toHaveFocus()
  })
})

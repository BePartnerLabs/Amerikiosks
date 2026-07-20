import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { TrustStripPauseToggle } from '@/blocks/TrustStrip/PauseToggle'

describe('TrustStripPauseToggle', () => {
  afterEach(cleanup)

  const renderWithViewport = () => {
    const viewportRef = createRef<HTMLDivElement>()
    const { container } = render(
      <>
        <div
          ref={viewportRef}
          className="ak-trust-strip__viewport"
        >
          <ul className="ak-trust-strip__track" />
        </div>
        <TrustStripPauseToggle viewportRef={viewportRef} />
      </>,
    )
    return { container, viewportRef }
  }

  it('renders a keyboard-focusable button', () => {
    renderWithViewport()
    const button = screen.getByRole('button', { name: /pause logo carousel/i })
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
    expect(button).not.toHaveAttribute('tabindex', '-1')
  })

  it('defaults to aria-pressed=false (playing)', () => {
    renderWithViewport()
    expect(screen.getByRole('button', { name: /pause logo carousel/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('toggles aria-pressed and label on click, and adds pause class to the viewport', () => {
    const { viewportRef } = renderWithViewport()
    const button = screen.getByRole('button', { name: /pause logo carousel/i })

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /play logo carousel/i })).toBeInTheDocument()
    expect(viewportRef.current).toHaveClass('ak-trust-strip__viewport--paused')
  })

  it('toggles back to playing on a second click, removing the pause class', () => {
    const { viewportRef } = renderWithViewport()
    const button = screen.getByRole('button', { name: /pause logo carousel/i })

    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: /play logo carousel/i }))

    expect(screen.getByRole('button', { name: /pause logo carousel/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(viewportRef.current).not.toHaveClass('ak-trust-strip__viewport--paused')
  })

  it('toggles on Enter key press (native button behavior)', () => {
    const { viewportRef } = renderWithViewport()
    const button = screen.getByRole('button', { name: /pause logo carousel/i })

    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    fireEvent.click(button)

    expect(viewportRef.current).toHaveClass('ak-trust-strip__viewport--paused')
  })
})

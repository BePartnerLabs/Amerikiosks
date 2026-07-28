import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { AccessibilityWidget } from '@/components/AccessibilityWidget'
import { A11Y_STORAGE_KEY } from '@/utilities/a11yPrefs'

function installFakeSpeech() {
  const synth = {
    speaking: false,
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => []),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string
      lang = ''
      voice: unknown = null
      onend: (() => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    },
  )
  return synth
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: 'fabLabel' }))
}

describe('AccessibilityWidget', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-motion')
    document.documentElement.style.removeProperty('--ak-a11y-text-scale')
    installFakeSpeech()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders the FAB collapsed with the panel closed', () => {
    render(<AccessibilityWidget />)
    const fab = screen.getByRole('button', { name: 'fabLabel' })
    expect(fab).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the panel and marks the FAB expanded', () => {
    render(<AccessibilityWidget />)
    openPanel()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fabLabel' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('closes the panel on Escape and returns focus to the FAB', () => {
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fabLabel' })).toHaveFocus()
  })

  it('toggles high contrast and reflects it on <html> and in aria-pressed', () => {
    render(<AccessibilityWidget />)
    openPanel()
    const toggle = screen.getByRole('button', { name: /contrast/ })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('on')
  })

  it('selects a text size via the radio group', () => {
    render(<AccessibilityWidget />)
    openPanel()
    const larger = screen.getByRole('radio', { name: 'textSizeLarger' })
    fireEvent.click(larger)
    expect(larger).toBeChecked()
    expect(document.documentElement.style.getPropertyValue('--ak-a11y-text-scale')).toBe('1.3')
  })

  it('resets every preference', () => {
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: /reduceMotion/ }))
    expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('reduce')
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    expect(document.documentElement.hasAttribute('data-a11y-motion')).toBe(false)
    expect(JSON.parse(window.localStorage.getItem(A11Y_STORAGE_KEY) ?? '{}').reduceMotion).toBe(
      false,
    )
  })

  it('speaks a clicked paragraph while read-aloud is on', () => {
    const synth = installFakeSpeech()
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<main id="main-content"><p>Hello there</p></main>',
    )
    render(<AccessibilityWidget />)
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: /readAloud/ }))

    const paragraph = document.querySelector('#main-content p') as HTMLElement
    fireEvent.click(paragraph)
    expect(synth.speak).toHaveBeenCalledTimes(1)

    document.getElementById('main-content')?.remove()
  })

  it('does not speak when read-aloud is off', () => {
    const synth = installFakeSpeech()
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<main id="main-content"><p>Hello there</p></main>',
    )
    render(<AccessibilityWidget />)
    const paragraph = document.querySelector('#main-content p') as HTMLElement
    fireEvent.click(paragraph)
    expect(synth.speak).not.toHaveBeenCalled()
    document.getElementById('main-content')?.remove()
  })

  it('hides the read-aloud control when the browser lacks speech synthesis', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    render(<AccessibilityWidget />)
    openPanel()
    expect(screen.queryByRole('button', { name: /readAloud/ })).not.toBeInTheDocument()
  })
})

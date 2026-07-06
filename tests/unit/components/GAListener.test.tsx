import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GAListener } from '@/components/Analytics/GAListener'

describe('GAListener', () => {
  afterEach(() => {
    cleanup()
    // biome-ignore lint/suspicious/noExplicitAny: test cleanup of a window-attached global
    delete (window as any).gtag
    document.documentElement.lang = ''
  })

  it('does nothing when gtag is not defined', () => {
    render(<GAListener />)
    const el = document.createElement('button')
    el.dataset.gaEvent = 'click_test'
    document.body.appendChild(el)
    expect(() => el.click()).not.toThrow()
    document.body.removeChild(el)
  })

  it('calls gtag with the event name and data attributes when a tracked element is clicked', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag
    document.documentElement.lang = 'en'

    render(<GAListener />)
    const el = document.createElement('button')
    el.dataset.gaEvent = 'cta_click'
    el.dataset.gaLabel = 'Contact Sales'
    document.body.appendChild(el)
    el.click()

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'cta_click',
      expect.objectContaining({ label: 'Contact Sales', locale: 'en' }),
    )
    document.body.removeChild(el)
  })

  it('ignores clicks on elements without data-ga-event', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag

    render(<GAListener />)
    const el = document.createElement('button')
    document.body.appendChild(el)
    el.click()

    expect(gtag).not.toHaveBeenCalled()
    document.body.removeChild(el)
  })

  it('picks up the block/section from the nearest data-ga-block ancestor', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag

    render(<GAListener />)
    const block = document.createElement('div')
    block.dataset.gaBlock = 'cta'
    block.dataset.gaSection = 'closing'
    const el = document.createElement('button')
    el.dataset.gaEvent = 'cta_click'
    el.dataset.gaLabel = 'Contact Sales'
    block.appendChild(el)
    document.body.appendChild(block)
    el.click()

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'cta_click',
      expect.objectContaining({ block: 'cta', section: 'closing' }),
    )
    document.body.removeChild(block)
  })
})

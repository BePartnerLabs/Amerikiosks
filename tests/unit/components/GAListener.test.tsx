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

  it('includes machineId when data-ga-machine-id is present (e.g. claim_submit from a QR-originated visit)', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag

    render(<GAListener />)
    const el = document.createElement('button')
    el.dataset.gaEvent = 'claim_submit'
    el.dataset.gaLabel = 'Claim submitted'
    el.dataset.gaMachineId = 'AK-0231'
    document.body.appendChild(el)
    el.click()

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'claim_submit',
      expect.objectContaining({ machineId: 'AK-0231' }),
    )
    document.body.removeChild(el)
  })

  it('the common case: omits machineId entirely (not the string "undefined") when data-ga-machine-id is absent', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag

    render(<GAListener />)
    const el = document.createElement('button')
    el.dataset.gaEvent = 'claim_submit'
    el.dataset.gaLabel = 'Claim submitted'
    document.body.appendChild(el)
    el.click()

    const [, , params] = gtag.mock.calls[0]
    expect(params.machineId).toBeUndefined()
    document.body.removeChild(el)
  })

  it('includes formName when data-ga-form-name is present (e.g. generate_lead from a modal form drawer)', () => {
    const gtag = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: assigning the global gtag mock for this test
    ;(window as any).gtag = gtag

    render(<GAListener />)
    const el = document.createElement('button')
    el.dataset.gaEvent = 'generate_lead'
    el.dataset.gaLabel = 'Partnership Program submitted'
    el.dataset.gaFormName = 'Partnership Program'
    document.body.appendChild(el)
    el.click()

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'generate_lead',
      expect.objectContaining({ formName: 'Partnership Program' }),
    )
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

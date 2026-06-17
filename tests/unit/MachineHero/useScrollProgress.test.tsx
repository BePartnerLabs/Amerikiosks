import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollProgress } from '@/components/MachineHero/useScrollProgress'

describe('useScrollProgress', () => {
  let innerHeight: number

  beforeEach(() => {
    innerHeight = window.innerHeight
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  afterEach(() => {
    cleanup()
    Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true })
    vi.restoreAllMocks()
  })

  function renderProbe(rectTop: number, rectHeight: number) {
    let progressValue = 0
    function Component() {
      const wrapperRef = { current: null as HTMLDivElement | null }
      const setRef = (el: HTMLDivElement | null) => {
        wrapperRef.current = el
        if (el) {
          el.getBoundingClientRect = () =>
            ({
              top: rectTop,
              height: rectHeight,
            }) as DOMRect
        }
      }
      progressValue = useScrollProgress(wrapperRef)
      return (
        <div
          ref={setRef}
          data-testid="wrapper"
        />
      )
    }
    const utils = render(<Component />)
    return { ...utils, getProgress: () => progressValue }
  }

  it('returns 0 when wrapper top has not reached viewport top', () => {
    const { getProgress } = renderProbe(500, 2400)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(getProgress()).toBe(0)
  })

  it('returns a value between 0 and 1 mid-scroll', () => {
    // height 2400, innerHeight 800 -> scrollable = 1600. top = -800 -> raw 0.5
    const { getProgress } = renderProbe(-800, 2400)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(getProgress()).toBeCloseTo(0.5)
  })

  it('clamps to 1 once fully scrolled past', () => {
    const { getProgress } = renderProbe(-3000, 2400)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(getProgress()).toBe(1)
  })

  it('treats a non-scrollable wrapper as fully progressed once its top reaches 0', () => {
    const { getProgress } = renderProbe(-10, 600)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(getProgress()).toBe(1)
  })
})

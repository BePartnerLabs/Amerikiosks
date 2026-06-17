import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInView } from '@/utilities/useInView'

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void

let observeCallback: ObserverCallback | null = null
const disconnect = vi.fn()
const observe = vi.fn()

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observeCallback = callback
  }
  observe = observe
  disconnect = disconnect
  unobserve = vi.fn()
}

function Probe({ once }: { once?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>({ once })
  return (
    <div
      ref={ref}
      data-testid="probe"
      data-in-view={inView}
    />
  )
}

describe('useInView', () => {
  beforeEach(() => {
    observeCallback = null
    observe.mockClear()
    disconnect.mockClear()
    // @ts-expect-error mock global
    global.IntersectionObserver = MockIntersectionObserver
  })

  afterEach(() => {
    cleanup()
    // @ts-expect-error cleanup mock global
    delete global.IntersectionObserver
  })

  it('starts not in view', () => {
    const { getByTestId } = render(<Probe />)
    expect(getByTestId('probe').dataset.inView).toBe('false')
  })

  it('becomes in view when intersecting', () => {
    const { getByTestId } = render(<Probe />)

    act(() => {
      observeCallback?.([{ isIntersecting: true }])
    })

    expect(getByTestId('probe').dataset.inView).toBe('true')
  })

  it('disconnects observer after first intersection when once=true (default)', () => {
    render(<Probe />)

    act(() => {
      observeCallback?.([{ isIntersecting: true }])
    })

    expect(disconnect).toHaveBeenCalled()
  })

  it('toggles back out of view when once=false', () => {
    const { getByTestId } = render(<Probe once={false} />)

    act(() => {
      observeCallback?.([{ isIntersecting: true }])
    })
    expect(getByTestId('probe').dataset.inView).toBe('true')

    act(() => {
      observeCallback?.([{ isIntersecting: false }])
    })
    expect(getByTestId('probe').dataset.inView).toBe('false')
  })
})

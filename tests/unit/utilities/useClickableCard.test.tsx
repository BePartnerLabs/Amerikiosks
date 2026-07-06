import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

import useClickableCard from '@/utilities/useClickableCard'

function TestCard({ external, newTab }: { external?: boolean; newTab?: boolean }) {
  const { card, link } = useClickableCard<HTMLDivElement>({ external, newTab })
  return (
    <div
      ref={card.ref}
      data-testid="card"
    >
      <a
        ref={link.ref}
        href="/target"
      >
        View target details
      </a>
    </div>
  )
}

describe('useClickableCard', () => {
  afterEach(() => {
    cleanup()
    push.mockClear()
    vi.restoreAllMocks()
  })

  it('navigates via router.push on a quick click outside the link', () => {
    const { getByTestId } = render(<TestCard />)
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 0 })
    fireEvent.mouseUp(card, { button: 0 })

    expect(push).toHaveBeenCalledWith('http://localhost:3000/target', { scroll: true })
  })

  it('does not navigate when the mouse down/up gap exceeds 250ms', () => {
    vi.useFakeTimers()
    const { getByTestId } = render(<TestCard />)
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 0 })
    vi.advanceTimersByTime(300)
    fireEvent.mouseUp(card, { button: 0 })

    expect(push).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('does not navigate when the mouse down originated inside a nested link', () => {
    const { getByTestId, container } = render(<TestCard />)
    const card = getByTestId('card')
    const nestedLink = container.querySelector('a') as HTMLAnchorElement

    fireEvent.mouseDown(nestedLink, { button: 0 })
    fireEvent.mouseUp(card, { button: 0 })

    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate on a ctrl-click', () => {
    const { getByTestId } = render(<TestCard />)
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 0 })
    fireEvent.mouseUp(card, { button: 0, ctrlKey: true })

    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate on a non-primary mouse button', () => {
    const { getByTestId } = render(<TestCard />)
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 1 })
    fireEvent.mouseUp(card, { button: 1 })

    expect(push).not.toHaveBeenCalled()
  })

  it('opens the link in a new tab via window.open when external and newTab are set', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { getByTestId } = render(
      <TestCard
        external
        newTab
      />,
    )
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 0 })
    fireEvent.mouseUp(card, { button: 0 })

    expect(openSpy).toHaveBeenCalledWith('http://localhost:3000/target', '_blank')
    expect(push).not.toHaveBeenCalled()
  })

  it('opens the link in the same tab via window.open when external is set without newTab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { getByTestId } = render(<TestCard external />)
    const card = getByTestId('card')

    fireEvent.mouseDown(card, { button: 0 })
    fireEvent.mouseUp(card, { button: 0 })

    expect(openSpy).toHaveBeenCalledWith('http://localhost:3000/target', '_self')
  })
})

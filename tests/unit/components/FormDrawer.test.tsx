import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormDrawerTrigger } from '@/components/FormDrawer'
import type { Form } from '@/payload-types'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

// Each mount gets a fresh id so the remount-on-close behaviour is observable
// from the outside without reaching into FormBlock's internals.
let formBlockMounts = 0
let lastRequestClose: (() => void) | undefined
vi.mock('@/blocks/Form/Component', () => ({
  FormBlock: ({ onRequestClose }: { onRequestClose: () => void }) => {
    formBlockMounts += 1
    lastRequestClose = onRequestClose
    return <div data-testid="form-block">form #{formBlockMounts}</div>
  },
}))

const form = { id: 1, title: 'Start a Partnership' } as unknown as Form

// jsdom implements neither the Popover API nor ToggleEvent, and the drawer
// leans on both.
const hidePopover = vi.fn()

beforeEach(() => {
  formBlockMounts = 0
  lastRequestClose = undefined
  hidePopover.mockClear()
  HTMLElement.prototype.hidePopover = hidePopover
  HTMLElement.prototype.showPopover = vi.fn()
})

afterEach(() => {
  cleanup()
})

function toggleEvent(newState: 'open' | 'closed') {
  const event = new Event('toggle') as Event & { newState: string }
  event.newState = newState
  return event
}

describe('FormDrawerTrigger', () => {
  it('renders the trigger with its children and wires it to the drawer', () => {
    render(
      <FormDrawerTrigger
        form={form}
        className="ak-cta"
      >
        Become a partner
      </FormDrawerTrigger>,
    )

    const trigger = screen.getByRole('button', { name: 'Become a partner' })
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveClass('ak-cta')
    expect(trigger.getAttribute('popovertarget')).toBeTruthy()
  })

  it('portals the drawer to document.body rather than leaving it beside the trigger', () => {
    const { container } = render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)

    const drawer = document.querySelector('.ak-link-drawer')
    expect(drawer).not.toBeNull()
    // Ambient CSS from a hero or card grid would otherwise bleed into it.
    expect(container.contains(drawer)).toBe(false)
    expect(drawer?.parentElement).toBe(document.body)
  })

  it('shows the form title and points the close button at the same drawer', () => {
    render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)

    // `hidden: true` because the drawer is a closed popover: it is in the DOM
    // but out of the accessibility tree until it opens, which is the point.
    expect(
      screen.getByRole('heading', { name: 'Start a Partnership', hidden: true }),
    ).toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: 'Open' })
    const close = screen.getByRole('button', { name: 'closeForm', hidden: true })
    expect(close.getAttribute('popovertarget')).toBe(trigger.getAttribute('popovertarget'))
    expect(close).toHaveAttribute('popovertargetaction', 'hide')
  })

  it('omits the heading when the form has no title', () => {
    render(<FormDrawerTrigger form={{ id: 2 } as unknown as Form}>Open</FormDrawerTrigger>)

    expect(screen.queryByRole('heading', { hidden: true })).not.toBeInTheDocument()
  })

  it('renders the form once on mount', () => {
    render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)

    expect(screen.getByTestId('form-block')).toHaveTextContent('form #1')
  })

  // The portal outlives every open/close, so without the remount a reopened
  // drawer showed the previous visit's thank-you instead of a fresh form.
  it('remounts the form when the drawer closes', () => {
    render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)
    const drawer = document.querySelector('.ak-link-drawer') as HTMLElement

    fireEvent(drawer, toggleEvent('closed'))

    expect(screen.getByTestId('form-block')).toHaveTextContent('form #2')
  })

  it('leaves the form alone when the drawer opens', () => {
    render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)
    const drawer = document.querySelector('.ak-link-drawer') as HTMLElement

    fireEvent(drawer, toggleEvent('open'))

    expect(screen.getByTestId('form-block')).toHaveTextContent('form #1')
  })

  it('closes the drawer when the form asks to be closed', () => {
    render(<FormDrawerTrigger form={form}>Open</FormDrawerTrigger>)

    lastRequestClose?.()

    expect(hidePopover).toHaveBeenCalledTimes(1)
  })
})

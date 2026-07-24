import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SupportHubBlock } from '@/blocks/SupportHub/Component'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())
vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}))

const baseProps = {
  phoneNumber: '+18885093699',
  whatsappNumber: '+18885093699',
  refundFormUrl: '/customer-service/request-a-refund',
}

describe('SupportHub block', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a Call link using the tel: scheme', () => {
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /call/i })
    expect(link).toHaveAttribute('href', 'tel:+18885093699')
  })

  it('renders a Text link using the sms: scheme', () => {
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /text/i })
    expect(link).toHaveAttribute('href', 'sms:+18885093699')
  })

  it('renders a WhatsApp link using wa.me with digits only (no + or symbols)', () => {
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /whatsapp/i })
    expect(link).toHaveAttribute('href', 'https://wa.me/18885093699')
  })

  it('renders a "Request a refund" link pointing at the claim form URL', () => {
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /request a refund/i })
    expect(link).toHaveAttribute('href', '/customer-service/request-a-refund')
  })

  it('appends machine_id to the refund link when present in the current URL', () => {
    useSearchParamsMock.mockReturnValueOnce(new URLSearchParams('machine_id=AK-0231'))
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /request a refund/i })
    expect(link).toHaveAttribute('href', '/customer-service/request-a-refund?machine_id=AK-0231')
  })

  it('leaves the refund link unchanged when machine_id is absent', () => {
    render(<SupportHubBlock {...baseProps} />)
    const link = screen.getByRole('link', { name: /request a refund/i })
    expect(link).toHaveAttribute('href', '/customer-service/request-a-refund')
  })

  it('renders an icon inside each action button', () => {
    render(<SupportHubBlock {...baseProps} />)
    for (const name of [/call/i, /text/i, /whatsapp/i, /request a refund/i]) {
      const link = screen.getByRole('link', { name })
      expect(link.querySelector('svg')).toBeInTheDocument()
    }
  })
})

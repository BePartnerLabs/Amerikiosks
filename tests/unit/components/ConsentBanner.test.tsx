import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

import { ConsentBanner } from '@/components/ConsentBanner/ConsentBanner'

describe('ConsentBanner', () => {
  afterEach(cleanup)

  const noop = () => {}

  it('renders collapsed actions when not expanded', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'acceptAll' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reject' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'preferences' })).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: 'analyticsLabel' })).not.toBeInTheDocument()
  })

  it('calls onAcceptAll when the accept button is clicked', () => {
    const onAcceptAll = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={onAcceptAll}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'acceptAll' }))
    expect(onAcceptAll).toHaveBeenCalledTimes(1)
  })

  it('calls onReject when the reject button is clicked', () => {
    const onReject = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={onReject}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'reject' }))
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  it('calls onExpand when preferences is clicked', () => {
    const onExpand = vi.fn()
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={onExpand}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'preferences' }))
    expect(onExpand).toHaveBeenCalledTimes(1)
  })

  it('shows the necessary (always-on, disabled) and analytics toggles when expanded', () => {
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    const necessary = screen.getByRole('switch', { name: 'necessaryLabel' })
    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    const analytics = screen.getByRole('switch', { name: 'analyticsLabel' })
    expect(analytics).toBeChecked()
    expect(analytics).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
  })

  it('calls onAnalyticsChange with the new checked state when the analytics toggle changes', () => {
    const onAnalyticsChange = vi.fn()
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={onAnalyticsChange}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    fireEvent.click(screen.getByRole('switch', { name: 'analyticsLabel' }))
    expect(onAnalyticsChange).toHaveBeenCalledWith(false)
  })

  it('calls onSave when the save button is clicked in expanded mode', () => {
    const onSave = vi.fn()
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={false}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={onSave}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('renders a Cookie Policy link pointing at /cookie-policy', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    const link = screen.getByRole('link', { name: 'cookiePolicyLabel' })
    expect(link).toHaveAttribute('href', '/cookie-policy')
  })

  it('renders category info tooltip triggers with distinct accessible labels when expanded', () => {
    render(
      <ConsentBanner
        expanded={true}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'necessaryInfoLabel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'analyticsInfoLabel' })).toBeInTheDocument()
  })

  it('does not render category info tooltips when collapsed', () => {
    render(
      <ConsentBanner
        expanded={false}
        analyticsChecked={true}
        onExpand={noop}
        onAnalyticsChange={noop}
        onAcceptAll={noop}
        onReject={noop}
        onSave={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: 'necessaryInfoLabel' })).not.toBeInTheDocument()
  })
})

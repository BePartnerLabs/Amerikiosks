import { render, waitFor } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTurnstile } from '@/blocks/Form/useTurnstile'

type RenderOpts = {
  sitekey: string
  callback: (token: string) => void
  'expired-callback'?: () => void
}

let lastOpts: RenderOpts | undefined
const turnstileRender = vi.fn((_el: HTMLElement, opts: RenderOpts) => {
  lastOpts = opts
  return 'widget-1'
})
const turnstileReset = vi.fn()

/**
 * Stands in for the script Cloudflare would append. jsdom never fetches it, so
 * fire the load/error handler ourselves on the next tick.
 */
function stubScriptLoading({ fail = false } = {}) {
  const original = document.head.appendChild.bind(document.head)
  vi.spyOn(document.head, 'appendChild').mockImplementation(((node: HTMLElement) => {
    const el = original(node)
    if (node instanceof HTMLScriptElement) {
      queueMicrotask(() => {
        if (fail) {
          node.onerror?.(new Event('error'))
        } else {
          Object.assign(window, { turnstile: { render: turnstileRender, reset: turnstileReset } })
          node.onload?.(new Event('load'))
        }
      })
    }
    return el
  }) as typeof document.head.appendChild)
}

function setSiteKeyMeta(key: string) {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'turnstile-site-key')
  meta.setAttribute('content', key)
  document.head.appendChild(meta)
}

// The hook hands back a ref that only does anything once it is attached to a
// real node, so exercise it through a component that mounts it the way the
// form's markup does — not through renderHook, where the ref stays null.
type HookValue = ReturnType<typeof useTurnstile>
let current: HookValue

function Probe({ active = true }: { active?: boolean }) {
  const value = useTurnstile(active)
  current = value
  return <div ref={value.containerRef} />
}

describe('useTurnstile', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    lastOpts = undefined
    vi.clearAllMocks()
    Reflect.deleteProperty(window, 'turnstile')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // With the feature off the layout emits no meta tag, and forms must submit
  // exactly as they did before Turnstile existed.
  it('stays disabled and loads nothing when there is no site-key meta tag', async () => {
    const appendSpy = vi.spyOn(document.head, 'appendChild')
    render(<Probe />)

    await waitFor(() => expect(current.enabled).toBe(false))
    expect(current.token).toBeUndefined()
    expect(appendSpy).not.toHaveBeenCalled()
  })

  it('reports enabled once the site key is present in the DOM', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading()

    render(<Probe />)

    await waitFor(() => expect(current.enabled).toBe(true))
  })

  it('renders the widget with that site key and exposes the token it returns', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading()

    render(<Probe />)
    await waitFor(() => expect(turnstileRender).toHaveBeenCalled())
    expect(lastOpts?.sitekey).toBe('0x4AAA')

    await act(async () => lastOpts?.callback('token-abc'))
    expect(current.token).toBe('token-abc')
  })

  it('drops the token when the widget reports it expired', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading()

    render(<Probe />)
    await waitFor(() => expect(turnstileRender).toHaveBeenCalled())
    await act(async () => lastOpts?.callback('token-abc'))
    expect(current.token).toBe('token-abc')

    await act(async () => lastOpts?.['expired-callback']?.())
    expect(current.token).toBeUndefined()
  })

  it('resets the widget and clears the token on reset()', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading()

    render(<Probe />)
    await waitFor(() => expect(turnstileRender).toHaveBeenCalled())
    await act(async () => lastOpts?.callback('token-abc'))

    await act(async () => current.reset())

    expect(turnstileReset).toHaveBeenCalledWith('widget-1')
    expect(current.token).toBeUndefined()
  })

  it('renders the widget only once across re-renders', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading()

    const { rerender } = render(<Probe />)
    await waitFor(() => expect(turnstileRender).toHaveBeenCalledTimes(1))

    rerender(<Probe />)
    await act(async () => {})

    expect(turnstileRender).toHaveBeenCalledTimes(1)
  })

  // A blocked or failing Cloudflare script must not make the form
  // unsubmittable — it logs and leaves the token undefined.
  it('swallows a script that fails to load', async () => {
    setSiteKeyMeta('0x4AAA')
    stubScriptLoading({ fail: true })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<Probe />)

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('[turnstile]', expect.any(Error)))
    expect(current.token).toBeUndefined()
    expect(turnstileRender).not.toHaveBeenCalled()
  })
  // Each modal drawer mounts its own FormBlock, so a widget per form meant a
  // dozen Cloudflare challenges on one page load. Neither the script nor the
  // widget may exist until the form is actually engaged — but `enabled` reports
  // true from the start, which is what lets the form reserve the widget's space
  // instead of having 72px appear above the submit button mid-typing.
  it('loads nothing until it is activated, while still reporting itself enabled', async () => {
    document.head.innerHTML = '<meta name="turnstile-site-key" content="site-key" />'

    render(<Probe active={false} />)

    await waitFor(() => {
      expect(current.enabled).toBe(true)
    })
    expect(document.getElementById('cf-turnstile-script')).toBeNull()
    expect(turnstileRender).not.toHaveBeenCalled()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { setDefaultIntegrationTarget } from '@/collections/Claims/hooks/setDefaultIntegrationTarget'

function fakeReq(defaultClaimIntegrationTarget?: string) {
  const findGlobal = vi.fn().mockResolvedValue({ defaultClaimIntegrationTarget })
  return { payload: { findGlobal }, req: { payload: { findGlobal } } }
}

describe('setDefaultIntegrationTarget', () => {
  it('sets integrationTarget from Settings.defaultClaimIntegrationTarget on create when unset', async () => {
    const { payload } = fakeReq('monday')
    const result = await setDefaultIntegrationTarget({
      data: { customerFirstName: 'Test' },
      operation: 'create',
      req: { payload } as never,
    } as never)

    expect(payload.findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'settings' }))
    expect(result?.integrationTarget).toBe('monday')
  })

  it('falls back to jotform when Settings has no value configured', async () => {
    const { payload } = fakeReq(undefined)
    const result = await setDefaultIntegrationTarget({
      data: { customerFirstName: 'Test' },
      operation: 'create',
      req: { payload } as never,
    } as never)

    expect(result?.integrationTarget).toBe('jotform')
  })

  it('does not override an explicitly provided integrationTarget', async () => {
    const { payload } = fakeReq('monday')
    const result = await setDefaultIntegrationTarget({
      data: { customerFirstName: 'Test', integrationTarget: 'odoo' },
      operation: 'create',
      req: { payload } as never,
    } as never)

    expect(payload.findGlobal).not.toHaveBeenCalled()
    expect(result?.integrationTarget).toBe('odoo')
  })

  it('does nothing on update — only applies at creation time', async () => {
    const { payload } = fakeReq('monday')
    const result = await setDefaultIntegrationTarget({
      data: { customerFirstName: 'Test' },
      operation: 'update',
      req: { payload } as never,
    } as never)

    expect(payload.findGlobal).not.toHaveBeenCalled()
    expect(result?.integrationTarget).toBeUndefined()
  })
})

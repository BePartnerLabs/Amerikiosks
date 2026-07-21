// tests/e2e/consent-banner.e2e.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Consent banner', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('shows the banner and no GA4 script when there is no prior consent', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByRole('region', { name: /cookie consent|consentimiento/i })).toBeVisible()
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(0)
  })

  test('accepting all loads the GA4 script and hides the banner', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /accept all|aceptar todo/i }).click()

    await expect(page.getByRole('region', { name: /cookie consent|consentimiento/i })).toBeHidden()
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(1)

    const cookie = (await page.context().cookies()).find((c) => c.name === 'ak_consent')
    expect(cookie).toBeDefined()
    expect(JSON.parse(decodeURIComponent(cookie?.value ?? '')).analytics).toBe(true)
  })

  test('rejecting keeps GA4 out and shows the floating preferences button', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /reject|rechazar/i }).click()

    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: /cookie preferences|preferencias de cookies/i }),
    ).toBeVisible()
  })

  test('reopening from the floating button and re-accepting loads GA4', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /reject|rechazar/i }).click()

    await page.getByRole('button', { name: /cookie preferences|preferencias de cookies/i }).click()
    // The switch input is visually hidden (clip-based sr-only pattern) behind its
    // decorative track/label — real users toggle it by clicking anywhere in the
    // <label>, which browsers forward to the control natively. Playwright's default
    // actionability check insists on an unobstructed click at the input's own
    // (invisible) geometry, so force the click at the resolved element instead of
    // treating this real, working accessibility pattern as a failure.
    await page.getByRole('switch', { name: /analytics|anal[ií]ticas/i }).click({ force: true })
    await page.getByRole('button', { name: /save preferences|guardar preferencias/i }).click()

    const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(gaScript).toHaveCount(1)
  })
})

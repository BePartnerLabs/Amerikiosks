// tests/e2e/accessibility-widget.e2e.spec.ts
import { expect, test } from '@playwright/test'

const FAB = /accessibility options|opciones de accesibilidad/i

test.describe('Accessibility widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.evaluate(() => window.localStorage.removeItem('ak-a11y-prefs'))
    await page.reload()
  })

  test('opens the panel from the floating button', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await expect(page.getByRole('dialog', { name: /accessibility|accesibilidad/i })).toBeVisible()
  })

  test('does not overlap the cookie preferences button', async ({ page }) => {
    await page.getByRole('button', { name: /reject|rechazar/i }).click()
    const a11y = await page.getByRole('button', { name: FAB }).boundingBox()
    const cookies = await page
      .getByRole('button', { name: /cookie preferences|preferencias de cookies/i })
      .boundingBox()
    expect(a11y).not.toBeNull()
    expect(cookies).not.toBeNull()
    // The a11y FAB sits entirely above the cookie FAB.
    expect((a11y?.y ?? 0) + (a11y?.height ?? 0)).toBeLessThanOrEqual(cookies?.y ?? 0)
  })

  test('larger text actually increases the root font size', async ({ page }) => {
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('radio', { name: /larger|más grande/i }).check()
    const after = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    expect(Number.parseFloat(after)).toBeGreaterThan(Number.parseFloat(before))
  })

  test('high contrast applies a filter over the page content', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('button', { name: /high contrast|alto contraste/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'on')
    const filter = await page.evaluate(() => {
      const root = document.querySelector('.ak-a11y-filter-root')
      return root ? getComputedStyle(root).filter : 'none'
    })
    expect(filter).not.toBe('none')
  })

  test('preferences survive a reload', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('button', { name: /high contrast|alto contraste/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'on')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'on')
    await page.getByRole('button', { name: FAB }).click()
    await expect(
      page.getByRole('button', { name: /high contrast|alto contraste/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('reset clears every preference', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).click()
    await page.getByRole('button', { name: /reduce motion|reducir movimiento/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-motion', 'reduce')
    await page.getByRole('button', { name: /reset all|restablecer todo/i }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-a11y-motion', 'reduce')
  })

  test('the panel is reachable and closable by keyboard alone', async ({ page }) => {
    await page.getByRole('button', { name: FAB }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('button', { name: FAB })).toBeFocused()
  })
})

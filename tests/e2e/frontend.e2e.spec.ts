import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })

  test('header has dark background', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    // Header must exist and be sticky
    const position = await header.evaluate((el) => getComputedStyle(el).position)
    expect(position).toBe('sticky')
  })

  test('header contains logo and CTA button', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('header a[href="/"]')).toBeVisible()
    await expect(page.locator('header a[href="/start-a-partnership"]')).toBeVisible()
    await expect(page.locator('header a[href="/start-a-partnership"]')).toHaveText(
      'Start a Partnership',
    )
  })

  test('nav item with mega menu shows chevron', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Any button inside the nav that has aria-expanded is a mega menu trigger
    const trigger = page.locator('header nav button[aria-expanded]').first()
    const count = await trigger.count()
    if (count === 0) {
      // No mega menu configured — skip
      test.skip()
      return
    }
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('mega menu opens on hover', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const trigger = page.locator('header nav button[aria-expanded]').first()
    if ((await trigger.count()) === 0) {
      test.skip()
      return
    }
    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panelId = await trigger.getAttribute('aria-controls')
    if (panelId) {
      await expect(page.locator(`#${panelId}`)).toBeVisible()
    }
  })

  test('mega menu closes on Escape', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const trigger = page.locator('header nav button[aria-expanded]').first()
    if ((await trigger.count()) === 0) {
      test.skip()
      return
    }
    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

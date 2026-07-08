import { expect, test } from '@playwright/test'

test.describe('Customer service', () => {
  test('hub page renders Call/Text/WhatsApp/Request-a-refund links', async ({ page }) => {
    await page.goto('http://localhost:3000/customer-service')

    await expect(page.locator('a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('a[href^="sms:"]')).toBeVisible()
    await expect(page.locator('a[href^="https://wa.me/"]')).toBeVisible()
    await expect(page.locator('a[href="/customer-service/request-a-refund"]')).toBeVisible()
  })

  test('claim form page preserves the exact URL printed on physical kiosk QR codes', async ({
    page,
  }) => {
    const response = await page.goto(
      'http://localhost:3000/customer-service/request-a-refund?machine_id=AK-0231',
    )
    expect(response?.status()).toBe(200)
    expect(page.url()).toContain('/customer-service/request-a-refund')
  })

  test('submitting the multi-step claim form shows a confirmation with real field labels (not JotForm-style placeholders)', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/customer-service/request-a-refund?machine_id=AK-0231')

    await page.getByRole('button', { name: /^start$/i }).click()

    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.getByRole('radio', { name: /credit\/debit card/i }).check()
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.locator('#customerName').fill('Test Prueba')
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.locator('#customerEmail').fill('hola@bepartnerlabs.com')
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.locator('#customerPhone').fill('3055550100')
    await page.getByRole('button', { name: /^next$/i }).click()

    // transactionDateTime — prefilled by default
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.locator('#location\\.state').fill('FL')
    await page.locator('#location\\.city').fill('Doral')
    await page.locator('#location\\.propertyName').fill('BePartnerLabs Test Property')
    await page.getByRole('button', { name: /^next$/i }).click()

    await page.locator('#claimReason').selectOption('partial_dispense')
    await page.getByRole('button', { name: /^next$/i }).click()

    // additionalInfo (optional) — skip
    await page.getByRole('button', { name: /^next$/i }).click()

    // lastFourCardDigits (optional) — last step, submit
    await page.getByRole('button', { name: /submit/i }).click()

    const success = page.getByTestId('claim-form-success')
    await expect(success).toBeVisible()
    await expect(success).toHaveAttribute('data-ga-event', 'claim_submit')
    await expect(success).toHaveAttribute('data-ga-machine-id', 'AK-0231')
    await expect(success).toContainText('Kiosk Brand')
    await expect(success).toContainText('Payment Method')
    await expect(success).not.toContainText('Type a question')
  })
})

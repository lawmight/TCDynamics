import { expect, test } from '@playwright/test'

test.describe('Contact Form Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete contact form successfully', async ({ page }) => {
    // Navigate to contact section
    await page.click('text=Contact')

    // Wait for form to be visible
    await expect(page.locator('input[name="name"]')).toBeVisible()

    // Fill out the form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('input[name="phone"]', '+33123456789')
    await page.fill('input[name="company"]', 'Test Company')
    await page.fill(
      'textarea[name="message"]',
      'This is a test message from E2E tests'
    )

    // Submit the form
    await page.click('button:has-text("Envoyer")')

    // Should show success message
    await expect(page.locator('text=Message envoyé')).toBeVisible()
    await expect(
      page.locator('text=Nous vous répondrons dans les plus brefs délais')
    ).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Contact')

    // Try to submit empty form
    await page.click('button:has-text("Envoyer")')

    // Should show validation errors
    await expect(page.locator('text=Le nom est requis')).toBeVisible()
    await expect(page.locator("text=L'email est requis")).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.click('text=Contact')

    // Fill form with invalid email
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('textarea[name="message"]', 'Test message')

    await page.click('button:has-text("Envoyer")')

    // Should show email validation error
    await expect(page.locator('text=Adresse email invalide')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/contact', route => route.abort())

    await page.click('text=Contact')

    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('textarea[name="message"]', 'Test message')

    await page.click('button:has-text("Envoyer")')

    // Should show error message
    await expect(page.locator("text=Erreur lors de l'envoi")).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.click('text=Contact')

    // Form should be accessible on mobile
    await expect(page.locator('input[name="name"]')).toBeVisible()

    // Mobile menu should work
    const mobileMenuButton = page.locator('button[aria-label*="menu"]')
    await mobileMenuButton.click()

    await expect(page.locator('text=Accueil')).toBeVisible()
  })
})

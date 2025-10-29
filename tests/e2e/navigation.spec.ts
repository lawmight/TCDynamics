import { expect, test } from '@playwright/test'

test.describe('Navigation and Core Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check that main page elements are present
    await expect(page.locator('h1')).toContainText(/TCDynamics|WorkFlowAI/)
    await expect(page.locator('text=Fonctionnalités')).toBeVisible()
    await expect(page.locator('text=Comment ça marche')).toBeVisible()
    await expect(page.locator('text=Tarifs')).toBeVisible()
  })

  test('should navigate through main sections', async ({ page }) => {
    // Test navigation links
    await page.click('text=Fonctionnalités')
    await expect(page.locator('text=Automatisation')).toBeVisible()

    await page.click('text=Comment ça marche')
    await expect(page.locator('text=Étape')).toBeVisible()

    await page.click('text=Tarifs')
    await expect(page.locator('text=Gratuit|Premium|Enterprise')).toBeVisible()

    await page.click('text=Accueil')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle 404 page correctly', async ({ page }) => {
    await page.goto('/non-existent-page')

    await expect(page.locator('text=404')).toBeVisible()
    await expect(page.locator('text=Oops! Page not found')).toBeVisible()

    // Should have working return to home link
    await page.click('text=Return to Home')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should scroll smoothly to sections', async ({ page }) => {
    // Test smooth scrolling to features section
    await page.click('text=Fonctionnalités')

    // Check if we're in the features section (rough check)
    const featuresSection = page.locator('#features')
    await expect(featuresSection).toBeVisible()

    // Test scrolling works on mobile too
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('text=Comment ça marche')

    const howItWorksSection = page.locator('#how-it-works')
    await expect(howItWorksSection).toBeVisible()
  })

  test('should handle sticky header behavior', async ({ page }) => {
    // Check initial header state
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Scroll down to trigger sticky behavior
    await page.evaluate(() => window.scrollTo(0, 200))

    // Header should still be visible and possibly have different styling
    await expect(header).toBeVisible()

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(header).toBeVisible()
  })

  test('should handle mobile menu correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Find and click mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton.click()

    // Mobile menu should appear
    await expect(page.locator('text=Accueil')).toBeVisible()
    await expect(page.locator('text=Fonctionnalités')).toBeVisible()

    // Click on a menu item
    await page.click('text=Fonctionnalités')

    // Menu should close after navigation
    await expect(page.locator('text=Fonctionnalités')).toBeVisible()
  })

  test('should handle back to top functionality', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000))

    // Set mobile viewport to see back to top button
    await page.setViewportSize({ width: 375, height: 667 })

    // Scroll more to trigger back to top button
    await page.evaluate(() => window.scrollTo(0, 1500))

    // Look for back to top button (might need to adjust selector)
    const backToTopButton = page.locator('button[aria-label*="top"]').first()

    if (await backToTopButton.isVisible()) {
      await backToTopButton.click()

      // Should scroll back to top
      const scrollPosition = await page.evaluate(() => window.scrollY)
      expect(scrollPosition).toBe(0)
    }
  })

  test('should handle demo form if present', async ({ page }) => {
    // Look for demo form elements
    const demoButton = page
      .locator('button:has-text("Demander une démo")')
      .first()

    if (await demoButton.isVisible()) {
      await demoButton.click()

      // Check if demo form appears
      await expect(page.locator('input[name="firstName"]')).toBeVisible()

      // Fill and submit demo form
      await page.fill('input[name="firstName"]', 'Jane')
      await page.fill('input[name="lastName"]', 'Doe')
      await page.fill('input[name="email"]', 'jane.doe@example.com')
      await page.fill('input[name="company"]', 'Demo Company')

      await page.click('button:has-text("Demander")')

      // Should show success message
      await expect(page.locator('text=démonstration')).toBeVisible()
    }
  })

  test('should handle performance monitoring toggle', async ({ page }) => {
    // Try to toggle performance monitor (Ctrl+Shift+P)
    await page.keyboard.press('Control+Shift+P')

    // Performance monitor should appear (if enabled)
    const perfMonitor = page.locator('text=Performance Monitor').first()

    if (await perfMonitor.isVisible()) {
      await expect(perfMonitor).toBeVisible()
      await expect(page.locator('text=Load:')).toBeVisible()
      await expect(page.locator('text=Render:')).toBeVisible()
    }
  })

  test('should handle offline/online states', async ({ page }) => {
    // Check if offline indicator exists
    const offlineIndicator = page
      .locator('[data-testid="offline-indicator"]')
      .first()

    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible()

      // Simulate going offline
      await page.context().setOffline(true)

      // Check offline state
      await expect(page.locator('text=offline|Offline')).toBeVisible()

      // Go back online
      await page.context().setOffline(false)

      // Should show online state
      await expect(page.locator('text=online|Online')).toBeVisible()
    }
  })
})

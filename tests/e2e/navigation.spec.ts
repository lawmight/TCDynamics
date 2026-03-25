import { expect, test } from '@playwright/test'

test.describe('Navigation and Core Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.locator('#features')).toBeVisible()
    await expect(page.locator('#how-it-works')).toBeVisible()
    await expect(page.locator('#pricing')).toBeVisible()
  })

  test('should navigate through main sections', async ({ page }) => {
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()

    await footer.getByRole('link', { name: 'Fonctionnalités' }).click()
    await expect(page).toHaveURL(/#features/)
    await expect(page.locator('#features')).toBeVisible()

    await footer.getByRole('link', { name: 'Tarifs' }).click()
    await expect(page).toHaveURL(/#pricing/)
    await expect(page.locator('#pricing')).toBeVisible()

    await footer.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/#contact/)
    await expect(page.locator('#contact')).toBeVisible()
  })

  test('should handle 404 page correctly', async ({ page }) => {
    await page.goto('/non-existent-page')

    await expect(page.locator('text=404')).toBeVisible()
    await expect(
      page.getByText('Oups, cette page est introuvable.')
    ).toBeVisible()

    await page.getByRole('link', { name: "Retour à l'accueil" }).click()
    await expect(page).toHaveURL('/')
  })

  test('should open About page from the footer', async ({ page }) => {
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()

    await footer.getByRole('link', { name: 'À propos' }).click()
    await expect(
      page.getByRole('heading', {
        name: /IA opérationnelle pensée pour les PME françaises/i,
      })
    ).toBeVisible()
  })

  test('should keep footer deep links aligned with current routing', async ({
    page,
  }) => {
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()

    await expect(footer.getByRole('link', { name: 'À propos' })).toHaveAttribute(
      'href',
      '/about'
    )
    await expect(
      footer.getByRole('link', { name: 'Fonctionnalités' })
    ).toHaveAttribute('href', '/#features')
  })
})

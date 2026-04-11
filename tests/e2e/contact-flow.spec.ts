import { type Page, expect, test } from '@playwright/test'

test.describe('Contact Form Flow', () => {
  const gotoContactSection = async (page: Page) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    await footer.getByRole('link', { name: /^Contact$/ }).click()
    await expect(page).toHaveURL(/#contact/)
  }

  test.beforeEach(async ({ page }) => {
    await gotoContactSection(page)
  })

  test('should complete contact form successfully', async ({ page }) => {
    await page.route('**/api/forms', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Message envoyé avec succès',
        }),
      })
    })

    const form = page.getByTestId('general-contact-form')
    await expect(form).toBeVisible()

    await form.locator('input[name="firstName"]').fill('Jean')
    await form.locator('input[name="lastName"]').fill('Dupont')
    await form.locator('input[name="email"]').fill('jean.dupont@example.com')
    await form.locator('input[name="phone"]').fill('01 23 45 67 89')
    await form.locator('input[name="company"]').fill('TCDynamics')
    await form
      .locator('textarea[name="message"]')
      .fill('Bonjour, je souhaite en savoir plus sur vos services.')

    await page.getByTestId('general-contact-submit').click()

    await expect(
      page.getByRole('heading', { name: /Votre avis nous intéresse/i })
    ).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByTestId('general-contact-submit').click()

    await expect(page.getByText('Ce champ est requis').first()).toBeVisible()
    await expect(page.getByText("L'email est requis")).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    const form = page.getByTestId('general-contact-form')

    await form.locator('input[name="firstName"]').fill('Jean')
    await form.locator('input[name="lastName"]').fill('Dupont')
    await form.locator('input[name="email"]').fill('invalid-email')
    await form
      .locator('textarea[name="message"]')
      .fill('Message valide pour déclencher uniquement l erreur email.')

    await page.getByTestId('general-contact-submit').click()

    await expect(
      page.getByText('Veuillez entrer une adresse email valide')
    ).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/forms', async route => {
      await route.abort('failed')
    })

    const form = page.getByTestId('general-contact-form')
    await form.locator('input[name="firstName"]').fill('Jean')
    await form.locator('input[name="lastName"]').fill('Dupont')
    await form.locator('input[name="email"]').fill('jean.dupont@example.com')
    await form
      .locator('textarea[name="message"]')
      .fill('Bonjour, ceci est un message de test pour erreur réseau.')

    await page.getByTestId('general-contact-submit').click()

    await expect(page.getByRole('alert').last()).toBeVisible()
    await expect(page.getByRole('alert').last()).toContainText(
      /Erreur|Failed to fetch|NetworkError|connexion/i
    )
  })
})

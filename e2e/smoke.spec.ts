import { test, expect } from '@playwright/test'

test('app loads, fake login, navigate, and switch language', async ({ page }) => {
  await page.goto('/')

  // Home heading
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()

  // Fake login by setting localStorage and navigate to dashboard
  await page.evaluate(() => localStorage.setItem('authed', 'true'))
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

  // Switch language to Italian
  await page.goto('/')
  await page.getByLabel('Language switcher').selectOption('it')
  await expect(page.getByRole('heading', { name: /benvenuto/i })).toBeVisible()
})

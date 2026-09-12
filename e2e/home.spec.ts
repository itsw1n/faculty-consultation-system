import { expect, test } from '@playwright/test'

test('presents the branded Google authentication entry point', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CampusConnect/)
  await expect(page.getByRole('heading', { name: 'Welcome to CampusConnect' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
  await expect(page.getByText('Faculty Consultation & Scheduling System')).toBeVisible()
})

test('reflows without horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})

import { expect, test } from '@playwright/test'

test('presents the branded email authentication entry point', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Assumption College of Davao/)
  await expect(
    page.getByRole('heading', { name: 'Welcome to Assumption College of Davao' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByLabel('School email')).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Sign in/ })).toBeVisible()
  await expect(page.getByText('Faculty Consultation &')).toBeVisible()
})

test('reflows without horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})

test('makes the sign-in action reachable by keyboard', async ({ page }) => {
  await page.goto('/')
  for (let i = 0; i < 5; i += 1) {
    await page.keyboard.press('Tab')
  }
  await expect(page.getByRole('button', { name: /^Sign in/ })).toBeFocused()
})

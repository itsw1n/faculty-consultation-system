import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import { ensureAccount, getServiceClient, setProfile, uniqueEmail } from './helpers/testDatabase'

const password = 'Password123!'

test.describe('Email and password authentication', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('a verified student signs in through the form', async ({ page }) => {
    const email = uniqueEmail('e2e-password-student')
    const user = await ensureAccount(email, password, 'Password Student')
    await setProfile(user.id, { role: 'STUDENT', account_status: 'APPROVED' })

    await page.goto('/')
    await page.getByLabel('School email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/student')
  })

  test('an unverified account is blocked until the link is opened', async ({ page }) => {
    const email = uniqueEmail('e2e-password-unverified')
    const { error } = await getServiceClient().auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: 'Unverified Student' },
    })
    if (error) throw error

    await page.goto('/')
    await page.getByLabel('School email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText('verify your email')
  })

  test('the confirm route verifies the email and routes the user', async ({ page }) => {
    const email = uniqueEmail('e2e-password-confirm')
    const service = getServiceClient()
    const { data, error } = await service.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { data: { full_name: 'Confirm Student' } },
    })
    if (error || !data.user) throw error ?? new Error('generate link failed')
    await setProfile(data.user.id, { role: 'STUDENT', account_status: 'APPROVED' })

    await page.goto(`/auth/confirm?token_hash=${data.properties.hashed_token}&type=signup`)
    await expect(page).toHaveURL('/student')
  })

  test('self sign-up asks for email verification', async ({ page }) => {
    const email = uniqueEmail('e2e-password-signup')
    await page.goto('/auth/sign-up')
    await page.getByLabel('Full name').fill('Signup Student')
    await page.getByLabel('School email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByRole('status')).toContainText('Check your email')
  })

  test('password recovery is not offered during the demo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveCount(0)

    await page.goto('/auth/forgot-password')
    await expect(page).toHaveURL('/')

    await page.goto('/auth/reset-password')
    await expect(page).toHaveURL('/')
  })
})

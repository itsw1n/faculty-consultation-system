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
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
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
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
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
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByRole('status')).toContainText('Check your email')
  })

  test('a recovery link sets a new password', async ({ page }) => {
    const email = uniqueEmail('e2e-password-reset')
    const user = await ensureAccount(email, password, 'Reset Student')
    await setProfile(user.id, { role: 'STUDENT', account_status: 'APPROVED' })

    const { data, error } = await getServiceClient().auth.admin.generateLink({
      type: 'recovery',
      email,
    })
    if (error) throw error

    await page.goto(
      `/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/auth/reset-password`
    )
    await expect(page).toHaveURL('/auth/reset-password')

    const newPassword = 'NewPassword123!'
    await page.getByLabel('New password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm new password').fill(newPassword)
    await page.getByRole('button', { name: 'Save new password' }).click()
    await expect(page).toHaveURL('/student')
  })
})

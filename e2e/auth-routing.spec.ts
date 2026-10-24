import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  ensureAccount,
  getProfileByEmail,
  setAccountStatus,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'

const password = 'Password123!'

async function setupUser(prefix: string, role: 'ADMIN' | 'STUDENT' | 'FACULTY', name?: string) {
  const email = uniqueEmail(`${prefix}`)
  const user = await ensureAccount(
    email,
    password,
    name ?? `E2E User ${Date.now()}-${Math.floor(Math.random() * 10000)}`
  )
  await setProfile(user.id, { role, account_status: 'APPROVED' })
  return { user, email }
}

test.describe('Auth routing and gates', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('each role lands on its home after login', async ({ page }) => {
    const student = await setupUser('e2e-route-student', 'STUDENT')
    const faculty = await setupUser('e2e-route-faculty', 'FACULTY')
    const admin = await setupUser('e2e-route-admin', 'ADMIN')

    for (const [email, home] of [
      [student.email, '/student'],
      [faculty.email, '/faculty'],
      [admin.email, '/admin'],
    ] as const) {
      await signInAs(page, email, password)
      await page.goto('/auth/continue')
      await expect(page).toHaveURL(home)
    }
  })

  test('pending and rejected accounts are parked at the gates', async ({ page }) => {
    const pending = await setupUser('e2e-gate-pending', 'STUDENT')
    await setAccountStatus(pending.user.id, 'PENDING')
    const rejected = await setupUser('e2e-gate-rejected', 'STUDENT')
    await setAccountStatus(rejected.user.id, 'REJECTED')

    await signInAs(page, pending.email, password)
    await page.goto('/auth/continue')
    await expect(page).toHaveURL('/application/pending')
    await expect(page.getByText('Your application is pending approval.')).toBeVisible()
    await page.goto('/student')
    await expect(page).toHaveURL('/application/pending')

    await signInAs(page, rejected.email, password)
    await page.goto('/auth/continue')
    await expect(page).toHaveURL('/application/rejected')
    await expect(page.getByText('Your application was not approved.')).toBeVisible()
  })

  test('cross-role visits bounce to the visitors home', async ({ page }) => {
    const student = await setupUser('e2e-xrole-student', 'STUDENT')
    const faculty = await setupUser('e2e-xrole-faculty', 'FACULTY')
    const admin = await setupUser('e2e-xrole-admin', 'ADMIN')

    await signInAs(page, student.email, password)
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/student')
    await expect(page.getByText('Manage Users')).toHaveCount(0)

    await signInAs(page, faculty.email, password)
    await page.goto('/admin')
    await expect(page).toHaveURL('/faculty')

    await signInAs(page, admin.email, password)
    await page.goto('/student')
    await expect(page).toHaveURL('/admin')
  })

  test('the admin export API reports explicit authorization statuses', async ({
    page,
    request,
  }) => {
    const student = await setupUser('e2e-gate-status-student', 'STUDENT')
    const admin = await setupUser('e2e-gate-status-admin', 'ADMIN')
    const today = new Date().toISOString().slice(0, 10)
    const exportPath = `/admin/consultations/export?from=${today.slice(0, 4)}-01-01&to=${today}`

    const anonymous = await request.get(exportPath)
    expect(anonymous.status()).toBe(401)
    await expect(anonymous.json()).resolves.toMatchObject({ error: 'Authentication required.' })

    await signInAs(page, student.email, password)
    const denied = await page.request.get(exportPath)
    expect(denied.status()).toBe(403)
    await expect(denied.json()).resolves.toMatchObject({
      error: 'Administrator access required.',
    })

    await signInAs(page, admin.email, password)
    const allowed = await page.request.get(exportPath)
    expect(allowed.status()).toBe(200)
    expect(allowed.headers()['content-type']).toContain('text/csv')
  })

  test('sign-out ends the session', async ({ page }) => {
    const { email } = await setupUser('e2e-signout', 'STUDENT', 'E2E Signout User')

    await signInAs(page, email, password)
    await page.goto('/student')
    // Streamed loading UI can precede the shell; do not mistake that for desktop.
    await expect(page.locator('[data-ui="app-shell"]')).toBeVisible()
    const mobileMenu = page.getByLabel('Open navigation')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await page.locator('header').getByRole('button', { name: 'Sign out' }).click()
    } else {
      await page.locator('aside details summary').click()
      await page.locator('aside').getByRole('button', { name: 'Sign out' }).click()
    }
    await expect(page).toHaveURL('/')

    await page.goto('/student')
    await expect(page).toHaveURL('/')
  })

  test('a non-designated claim changes nothing', async ({ page }) => {
    const { email } = await setupUser('e2e-claim', 'STUDENT')

    await signInAs(page, email, password)
    await page.goto('/auth/claim-admin')
    await page.getByRole('button', { name: 'Claim administrator access' }).click()
    const formAlert = page.getByRole('main').getByRole('alert')
    await expect.poll(() => formAlert.textContent(), { timeout: 30_000 }).toMatch(/.+/)
    await expect(page).toHaveURL('/auth/claim-admin')

    const profile = await getProfileByEmail(email)
    expect(profile?.role).toBe('STUDENT')
  })
})

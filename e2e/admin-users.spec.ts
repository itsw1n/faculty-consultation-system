import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  ensureAccount,
  getFacultyProfile,
  getFirstDepartment,
  getInviteByEmail,
  getProfileByEmail,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'

test.describe('Manage Users directory', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')

  test('sends anonymous visitors back to sign-in', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
  })

  test('admin invites faculty and the invite persists in the database', async ({ page }) => {
    const adminEmail = uniqueEmail('e2e-admin')
    const admin = await ensureAccount(adminEmail, 'Password123!', 'E2E Admin')
    await setProfile(admin.id, { role: 'ADMIN', account_status: 'APPROVED' })
    const department = await getFirstDepartment()
    const inviteEmail = uniqueEmail('e2e-invite')

    await signInAs(page, adminEmail, 'Password123!')
    await page.goto('/admin/users')

    const inviteForm = page.getByRole('region', { name: 'Invite faculty' })
    await inviteForm.locator('textarea[name="emails"]').fill(inviteEmail)
    await inviteForm.getByRole('button', { name: 'Department' }).click()
    await page.getByRole('option', { name: department.name }).click()
    await inviteForm.getByPlaceholder('e.g. Instructor').fill('Instructor I')
    await inviteForm.getByRole('button', { name: 'Invite faculty' }).click()

    // The screen must say what the database says: invited, not skipped.
    await expect(inviteForm.getByText(`${inviteEmail} — invited`)).toBeVisible()
    await expect.poll(() => getInviteByEmail(inviteEmail)).not.toBeNull()
  })

  test('admin promotes an approved student and the directory shows it', async ({ page }) => {
    const adminEmail = uniqueEmail('e2e-admin')
    const admin = await ensureAccount(adminEmail, 'Password123!', 'E2E Admin')
    await setProfile(admin.id, { role: 'ADMIN', account_status: 'APPROVED' })
    const studentEmail = uniqueEmail('e2e-student')
    const student = await ensureAccount(studentEmail, 'Password123!', 'E2E Student')
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    const department = await getFirstDepartment()

    await signInAs(page, adminEmail, 'Password123!')
    await page.goto('/admin/users')

    const row = page.locator('article', { hasText: studentEmail })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Correct' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Role' }).click()
    await page.getByRole('option', { name: 'Faculty' }).click()
    await dialog.getByRole('button', { name: 'Department' }).click()
    await page.getByRole('option', { name: department.name }).click()
    await dialog.getByPlaceholder('Leave blank to keep current').fill('Instructor I')
    await dialog.getByRole('button', { name: 'Save correction' }).click()

    // The write must land even though this form gives no inline confirmation.
    await expect.poll(async () => (await getProfileByEmail(studentEmail))?.role).toBe('FACULTY')
    const facultyProfile = await getFacultyProfile(student.id)
    expect(facultyProfile?.position_title).toBe('Instructor I')

    await page.reload()
    await expect(
      page.locator('article', { hasText: studentEmail }).getByText('FACULTY')
    ).toBeVisible()
  })
})

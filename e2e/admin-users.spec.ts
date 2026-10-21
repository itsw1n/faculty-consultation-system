import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  ensureAccount,
  getFacultyProfile,
  getFirstDepartment,
  getProfileByEmail,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { waitForHydration } from './helpers/hydration'
import { signInAs } from './helpers/testSession'

test.describe('Manage Users directory', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')

  test('sends anonymous visitors back to sign-in', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/')
    await expect(page.getByLabel('School email')).toBeVisible()
  })

  test('admin promotes a registered Student through Add Faculty', async ({ page }) => {
    const adminEmail = uniqueEmail('e2e-admin')
    const admin = await ensureAccount(adminEmail, 'Password123!', 'E2E Admin')
    await setProfile(admin.id, { role: 'ADMIN', account_status: 'APPROVED' })
    const department = await getFirstDepartment()
    const facultyEmail = uniqueEmail('e2e-promote')
    const faculty = await ensureAccount(facultyEmail, 'Password123!', 'E2E New Faculty')

    await signInAs(page, adminEmail, 'Password123!')
    await page.goto('/admin/users')

    await page.getByRole('button', { name: 'Add Faculty' }).click()
    const dialog = page.getByRole('dialog', { name: 'Add Faculty' })
    await dialog.getByLabel('School email').fill(facultyEmail)
    await dialog.getByRole('button', { name: 'Department' }).click()
    await page.getByRole('option', { name: department.name }).click()
    await dialog.getByPlaceholder('e.g. Instructor').fill('Instructor I')
    await dialog.getByRole('button', { name: 'Add Faculty' }).click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('status')).toContainText('now a Faculty account')
    await expect.poll(async () => (await getProfileByEmail(facultyEmail))?.role).toBe('FACULTY')
    expect((await getFacultyProfile(faculty.id))?.position_title).toBe('Instructor I')
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

    const row = page.getByRole('row').filter({ hasText: studentEmail })
    await expect(row).toBeVisible()
    await waitForHydration(page, row.getByRole('button', { name: 'Edit User' }))
    await row.getByRole('button', { name: 'Edit User' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Role' }).click()
    await page.getByRole('option', { name: 'Faculty' }).click()
    await dialog.getByRole('button', { name: 'Department' }).click()
    await page.getByRole('option', { name: department.name }).click()
    await dialog.getByPlaceholder('e.g. Instructor').fill('Instructor I')
    await dialog.getByRole('button', { name: 'Save changes' }).click()

    await expect(dialog).not.toBeVisible()
    await expect.poll(async () => (await getProfileByEmail(studentEmail))?.role).toBe('FACULTY')
    const facultyProfile = await getFacultyProfile(student.id)
    expect(facultyProfile?.position_title).toBe('Instructor I')

    await page.reload()
    await expect(
      page.getByRole('row').filter({ hasText: studentEmail }).getByText('Faculty')
    ).toBeVisible()
  })
})
